import os
import io
import time
import shutil
import sqlite3
import hashlib
from collections import OrderedDict
from datetime import datetime
from typing import Optional, List

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
backend_ready = False  #flips to True once load_models() finishes, used by /health
checkpoint_info = {}  #which model.pth is actually loaded -- filled in at startup, shown in /health

#in-memory LRU cache for generated audio, so repeated phrases (very common in AAC use,
#e.g. tapping "أريد مية" multiple times) return instantly instead of re-running the model
TTS_CACHE_MAX_ITEMS = 50
tts_cache = OrderedDict()  #key: sha256(clean_text) -> value: raw wav bytes

DB_PATH = "aac_history.db"


def init_db():
    """Creates a tiny local SQLite log of phrases spoken through the app.
    Useful for a demo (caregivers reviewing what was communicated) and costs
    nothing extra to run alongside the TTS/STT models."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


#the fine-tuned Egyptian EGTTS-V0.1 checkpoint is ~5.61GB; the base multilingual
#coqui/XTTS-v2 checkpoint it was fine-tuned from is ~1.87GB. Since both load fine
#through the same Xtts class, this just tells you (and judges) which one is
#actually running -- no code path changes based on it.
def identify_checkpoint(model_dir: str) -> dict:
    model_path = os.path.join(model_dir, "model.pth")
    if not os.path.exists(model_path):
        return {"found": False, "path": model_path}

    size_gb = os.path.getsize(model_path) / (1024 ** 3)
    if size_gb > 3.0:
        label = "EGTTS-V0.1 (Egyptian Arabic fine-tune)"
    else:
        label = "coqui/XTTS-v2 (base multilingual -- generic Arabic, not Egyptian-tuned)"

    return {"found": True, "path": model_path, "size_gb": round(size_gb, 2), "label": label}


def log_history(text: str):
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO history (text, created_at) VALUES (?, ?)",
        (text, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()


#hand-tuned next-word suggestions for the AAC picture board. Keyed on the last
#word/label the user tapped (matching the Arabic labels used in PictureMode.jsx),
#value is the ranked list of likely next taps. No ML needed for this -- it's fast,
#predictable, and easy to demo.
NEXT_WORD_SUGGESTIONS = {
    "أريد": ["مية", "أكل", "حمام", "نوم", "دواء", "مساعدة"],
    "عاوز": ["مية", "أكل", "حمام", "نوم", "دواء", "مساعدة"],
    "لا أريد": ["نوم", "أكل", "دواء"],
    "ساعدني": ["دكتور", "ماما", "بابا", "اتصل بالإسعاف"],
    "مساعدة": ["دكتور", "ماما", "بابا"],
    "متألم": ["دكتور", "دواء", "مساعدة"],
    "جعان": ["أكل", "عيش", "رز"],
    "عطشان": ["مية"],
    "خايف": ["ماما", "بابا", "مساعدة"],
    "اذهب": ["بيت", "مدرسة", "حديقة"],
    "": ["أريد", "مساعدة", "لا أريد", "سعيد", "حزين"],  #suggestions to start a sentence
}

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
    global tts_model, gpt_cond_latent, speaker_embedding, normalizer, stt_model, backend_ready, checkpoint_info

    print("Initializing local history database...")
    init_db()

    print("Initializing Text Normalizer...")
    normalizer = TextNormalizer()

    #fixes the voice character across server restarts. XTTS's zero-shot voice
    #cloning (get_conditioning_latents below) and its generation sampling both
    #have some randomness, so without a fixed seed the same speaker.wav can
    #produce a noticeably different-sounding voice each time the server restarts.
    torch.manual_seed(42)

    checkpoint_info = identify_checkpoint("./my_model")
    if not checkpoint_info["found"]:
        raise RuntimeError(
            "my_model/model.pth is missing. See the README for how to get either "
            "the EGTTS-V0.1 (Egyptian) weights or the base coqui/XTTS-v2 weights."
        )
    print(f"Detected checkpoint: {checkpoint_info['label']} ({checkpoint_info['size_gb']} GB)")

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

    backend_ready = True
    print("✅ Backend is fully operational!")

#data validation
class TTSRequest(BaseModel):
    text: str
    temperature: Optional[float] = 0.75  #lets the frontend tune expressiveness later if wanted
    speed: Optional[float] = 1.0  #1.0 = model's default pace; >1.0 faster, <1.0 slower/more dragging
    save_to_history: Optional[bool] = True

MAX_TEXT_LENGTH = 500  #AAC phrases are short; this guards against accidental huge payloads

#the endpoint
@app.post("/speak")
async def generate_speech(request: TTSRequest):
    """The frontend sends a POST request here with raw text."""
    text = request.text.strip() if request.text else ""

    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    if len(text) > MAX_TEXT_LENGTH:
        raise HTTPException(status_code=400, detail=f"Text too long (max {MAX_TEXT_LENGTH} characters).")

    #keep speed within a range that still sounds natural
    speed = max(0.5, min(request.speed, 2.0))

    #clean the text
    clean_text = normalizer.normalize(text)
    print(f"Processing: {clean_text}")

    #check the cache first -- AAC users repeat common phrases constantly,
    #so this turns a multi-second model call into an instant response
    cache_key = hashlib.sha256(f"{clean_text}|{request.temperature}|{speed}".encode("utf-8")).hexdigest()
    if cache_key in tts_cache:
        tts_cache.move_to_end(cache_key)  #mark as recently used
        if request.save_to_history:
            log_history(text)
        return Response(content=tts_cache[cache_key], media_type="audio/wav")

    #generate audio
    try:
        out = tts_model.inference(
            clean_text,
            "ar", 
            gpt_cond_latent,
            speaker_embedding,
            temperature=request.temperature,
            speed=speed
        )

        audio_buffer = io.BytesIO()
        sf.write(audio_buffer, out["wav"], 24000, format='WAV', subtype='PCM_16')
        audio_bytes = audio_buffer.getvalue()

        #store in cache, evicting the oldest entry if we're full
        tts_cache[cache_key] = audio_bytes
        if len(tts_cache) > TTS_CACHE_MAX_ITEMS:
            tts_cache.popitem(last=False)

        if request.save_to_history:
            log_history(text)

        return Response(content=audio_bytes, media_type="audio/wav")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")

MAX_AUDIO_BYTES = 10 * 1024 * 1024  #10MB is generous for a short AAC voice note

@app.post("/stt")
async def transcribe_audio(audio_file: UploadFile = File(...)):
    """The frontend sends a recorded audio file here to get Arabic text back."""
    if not audio_file.filename.endswith(('.wav', '.mp3', '.m4a', '.webm', '.ogg')):
        raise HTTPException(status_code=400, detail="Invalid audio format.")

    #use a unique-ish temp name so two overlapping requests can't collide
    temp_file_path = f"temp_{int(time.time() * 1000)}_{audio_file.filename}"

    try:
        #save incoming audio from the React app to server temporarily, while
        #enforcing a size cap so a bad upload can't fill the disk
        size = 0
        with open(temp_file_path, "wb") as buffer:
            while chunk := await audio_file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_AUDIO_BYTES:
                    buffer.close()
                    os.remove(temp_file_path)
                    raise HTTPException(status_code=400, detail="Audio file too large.")
                buffer.write(chunk)

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


@app.get("/health")
async def health_check():
    """Quick status check -- handy during a live demo to confirm the models
    finished loading before you start tapping icons on stage."""
    return {
        "status": "ready" if backend_ready else "loading",
        "tts_loaded": tts_model is not None,
        "stt_loaded": stt_model is not None,
        "cached_phrases": len(tts_cache),
        "gpu": torch.cuda.is_available(),
        "checkpoint": checkpoint_info,
    }


@app.get("/history")
async def get_history(limit: int = 20):
    """Returns the most recently spoken phrases -- e.g. for a caregiver-facing
    'communication log' view in the frontend."""
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT id, text, created_at FROM history ORDER BY id DESC LIMIT ?",
        (limit,),
    ).fetchall()
    conn.close()
    return {
        "history": [
            {"id": r[0], "text": r[1], "created_at": r[2]} for r in rows
        ]
    }


@app.delete("/history")
async def clear_history():
    """Wipes the communication log (e.g. for privacy, or resetting before a demo)."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM history")
    conn.commit()
    conn.close()
    return {"status": "cleared"}


@app.get("/predict")
async def predict_next(last_word: str = ""):
    """Given the last tapped word/label, suggests likely next words -- a core
    AAC feature that speeds up communication by surfacing the most probable
    next tap instead of making the user hunt through every category.
    Pass last_word="" to get suggested sentence-starters."""
    suggestions = NEXT_WORD_SUGGESTIONS.get(last_word.strip(), [])
    return {"last_word": last_word, "suggestions": suggestions}
