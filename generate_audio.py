import os
import torch
import torchaudio

#monkey patching due to python ver being much newer than the version the library was built for
#the transformers library
import transformers.pytorch_utils
if not hasattr(transformers.pytorch_utils, 'isin_mps_friendly'):
    transformers.pytorch_utils.isin_mps_friendly = torch.isin

#bypass broken torchcodec/FFmpeg by forcing torchaudio to use soundfile
import soundfile as sf
def soundfile_load_patch(filepath, *args, **kwargs):
    data, samplerate = sf.read(filepath, dtype='float32')
    tensor = torch.tensor(data)
    if tensor.ndim == 1:
        tensor = tensor.unsqueeze(0)  #(1, samples) mono
    else:
        tensor = tensor.T  #(samples, channels) to (channels, samples)
    return tensor, samplerate

torchaudio.load = soundfile_load_patch

from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts

#importing the TextNormalizer 
from normalizer import TextNormalizer

print("1. Normalizing Text...")
normalizer = TextNormalizer()
messy_text = "طب أَهْلًااااا بِكُمْ فِى إِيجِيـــــبْت عشان كدة مَبْسُوطِين"
clean_text = normalizer.normalize(messy_text)
print("Cleaned:", clean_text)

print("\n2. Loading the AI Model...")
#pointing to dedicated model vault
config = XttsConfig()
config.load_json("my_model/config.json")
model = Xtts.init_from_config(config)

#weights (use_deepspeed=False is safer for Windows)
model.load_checkpoint(config, checkpoint_dir="my_model", use_deepspeed=False)

if torch.cuda.is_available():
    model.cuda()

print("\n3. Processing Speaker Reference...")
#to process the voice we want to clone
gpt_cond_latent, speaker_embedding = model.get_conditioning_latents(audio_path=["speaker.wav"])

print("\n4. Generating Egyptian Audio...")
out = model.inference(
    clean_text,
    "ar", #tells the model to use Arabic phonetics
    gpt_cond_latent,
    speaker_embedding,
    temperature=0.75
)

print("\n5. Saving File...")
# Use soundfile to save the generated audio, completely bypassing torchaudio/FFmpeg
sf.write("final_output.wav", out["wav"], 24000)
print("Success! You can now play final_output.wav")