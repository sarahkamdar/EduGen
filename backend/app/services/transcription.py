from faster_whisper import WhisperModel

model = None

def transcribe_audio(audio_path: str) -> str:
    """Transcribe audio file using faster-whisper base model (3-4x faster)."""
    global model
    if model is None:
        # Using base model with int8 quantization for speed
        # Options: tiny (fastest), base (balanced), small (more accurate)
        model = WhisperModel("base", device="cpu", compute_type="int8")
    
    segments, info = model.transcribe(audio_path, beam_size=1)
    text = " ".join([segment.text for segment in segments])
    return text
