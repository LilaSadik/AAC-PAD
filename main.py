import os
import io
import shutil
import torch
import torchaudio
import whisper
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel
import soundfile as sf

#monkey patching
import transformers.pytorch_utils
if not hasattr(transformers.pytorch_utils, 'isin_mps_friendly'):
    transformers.pytorch_utils.isin_mps_friendly = torch.isin

def soundfile_load_patch(filepath, *args, **kwargs):
    data, samplerate = sf.read(filepath, dtype='float32')
    tensor = torch.tensor(data)
    if tensor.ndim == 1:
        tensor = tensor.unsqueeze(0) 
    else:
        tensor = tensor.T 
    return tensor, samplerate
torchaudio.load = soundfile_load_patch

from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts
from normalizer import TextNormalizer

#global variables for the singleton:
tts_model = None
gpt_cond_latent = None
speaker_embedding = None
normalizer = None
stt_model = None

#application setup
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Egyptian AAC Backend")

#so React frontend can link with the backend 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  #in production, swap "*" for your React app's specific URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def load_models():
    """This runs ONCE when the server boots up."""
    global tts_model, gpt_cond_latent, speaker_embedding, normalizer, stt_model
    
    print("Initializing Text Normalizer...")
    normalizer = TextNormalizer()

    print("Loading XTTS Weights into Memory...")
    config = XttsConfig()
    config.load_json("./my_model/config.json")
    tts_model = Xtts.init_from_config(config)
    tts_model.load_checkpoint(config, checkpoint_dir="./my_model", use_deepspeed=False)
    
    if torch.cuda.is_available():
        tts_model.cuda()

    print("Computing Speaker Reference...")
    gpt_cond_latent, speaker_embedding = tts_model.get_conditioning_latents(audio_path=["./speaker.wav"])
    print("Loading Speech-to-Text Model...")
    #"base" is fast (change to "small" or "medium" higher accuracy is needed)
    stt_model = whisper.load_model("base") 

    print("✅ Backend is fully operational!")

#data validation
class TTSRequest(BaseModel):
    text: str

#the endpoint
@app.post("/speak")
async def generate_speech(request: TTSRequest):
    """The frontend sends a POST request here with raw text."""
    if not request.text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    #clean the text
    clean_text = normalizer.normalize(request.text)
    print(f"Processing: {clean_text}")

    #generate audio
    try:
        out = tts_model.inference(
            clean_text,
            "ar", 
            gpt_cond_latent,
            speaker_embedding,
            temperature=0.75
        )

        audio_buffer = io.BytesIO()
        sf.write(audio_buffer, out["wav"], 24000, format='WAV', subtype='PCM_16')
        return Response(content=audio_buffer.getvalue(), media_type="audio/wav")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")

@app.post("/stt")
async def transcribe_audio(audio_file: UploadFile = File(...)):
    """The frontend sends a recorded audio file here to get Arabic text back."""
    if not audio_file.filename.endswith(('.wav', '.mp3', '.m4a', '.webm', '.ogg')):
        raise HTTPException(status_code=400, detail="Invalid audio format.")

    temp_file_path = f"temp_{audio_file.filename}"
    
    try:
        #save incoming audio from the React app to server temporarily
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
        
        print(f"Transcribing {audio_file.filename}...")

        #run Whisper forcing Arabic language detection
        result = stt_model.transcribe(temp_file_path, language="ar")
        
        #clean up the temp file so server hard drive doesnt fill up
        os.remove(temp_file_path)

        return {"transcription": result["text"]}

    except Exception as e:
        #to ensure temp file is deleted even if AI crashes
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")