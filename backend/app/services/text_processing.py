import re
from transformers import pipeline

summarizer = None

def clean_text(text: str) -> str:
    """Remove extra whitespace and normalize spacing."""
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    return text.strip()

def summarize_text(text: str) -> str:
    """Generate concise summary using HuggingFace transformers."""
    global summarizer
    if summarizer is None:
        summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-6-6")
    
    result = summarizer(text, max_length=130, min_length=30, do_sample=False)
    return result[0]['summary_text']

def extract_key_points(text: str) -> list[str]:
    """Generate key points from text."""
    sentences = text.split('.')
    sentences = [s.strip() for s in sentences if s.strip()]
    
    key_points = []
    for i, sentence in enumerate(sentences):
        if len(key_points) >= 8:
            break
        if len(sentence) > 20:
            key_points.append(sentence)
    
    if len(key_points) < 5 and len(sentences) >= 5:
        key_points = sentences[:5]
    
    return key_points[:8]
