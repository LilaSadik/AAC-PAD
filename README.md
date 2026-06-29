##setup instructions

1. Clone this repository: `git clone https://github.com/LilaSadik/AAC-PAD.git`
2. Download the required model and audio assets from this link: [Insert Your Google Drive Link Here]
3. Download the model.pth file from here: https://huggingface.co/OmarSamir/EGTTS-V0.1/tree/main
4. Move `model.pth` into the `my_model/` folder, should already have `config.json` & `vocab.json`.
5. Move `speaker.wav` and any other audio files to the root directory.
6. Install dependencies: pip install fastapi uvicorn python-multipart pydantic TTS openai-whisper torch torchaudio soundfile transformers
7. **Setup Backend (FastAPI)**
   - Open your terminal and navigate to the root directory of the project.
   - Ensure you have your Python environment activated and the required dependencies installed.
   - Start the FastAPI server by running: `uvicorn main:app`
8. **Setup Frontend:**
   - Navigate to the `aac-frontend` folder.
   - Run `npm install` to download dependencies.
   - then `npm run dev`
9. Ensure both terminals remain open and running while testing the application.
10. Run the application :-)

**Head's up!**
This project requires **FFmpeg** for audio processing.

- **Windows:**
  1. Download the build from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/).
  2. Extract the folder and add the `bin` folder to your System PATH.
  3. Alternatively, install via Winget: `winget install ffmpeg`
- **macOS:**
  - Run: `brew install ffmpeg`
- **Linux (Ubuntu/Debian):**
  - Run: `sudo apt update && sudo apt install ffmpeg`

After installation, verify it by running `ffmpeg -version` in your terminal.

.

🏆 Credits & Acknowledgements
This project was made possible with the help and contributions of the following people:
* **Omar Samir** – For the [OmarSamir/EGTTS-V0.1](https://huggingface.co/OmarSamir/EGTTS-V0.1) model hosted on Hugging Face. The `.pth` model weights provided is the primary voice generation engine
* **Ali Abdallah** – For the [AliAbdallah21/Chatterbox-Multilingual-TTS-Fine-Tuning](https://github.com/AliAbdallah21/Chatterbox-Multilingual-TTS-Fine-Tuning) repository. This work provided the essential architecture, methodology, and pipeline required for fine-tuning the Text-to-Speech models.
* **Joejoe** – For the [joejoe03/Egyptian-Text-To-Speech](https://github.com/joejoe03/Egyptian-Text-To-Speech) repository. This provided crucial foundational code, implementation references, and dialect-specific structuring needed to adapt the TTS successfully for Egyptian Arabic.
And huge thanks for my partners, Kenzy Elborollosy and Jana Darwish! :-D
