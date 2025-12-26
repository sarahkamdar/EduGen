import whisper

model = None

def transcribe_audio(audio_path: str) -> str:
    """Transcribe audio file using Whisper base model."""
    global model
    if model is None:
        model = whisper.load_model("base")
    
    result = model.transcribe(audio_path)
    return result["text"]
