from groq import Groq
import os
import re
from dotenv import load_dotenv

load_dotenv()

def chunk_text(text: str, max_chars: int = 3000) -> list:
    """Split text into chunks by sentences."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current = ""
    
    for sentence in sentences:
        if len(current) + len(sentence) > max_chars and current:
            chunks.append(current.strip())
            current = sentence
        else:
            current += " " + sentence if current else sentence
    
    if current:
        chunks.append(current.strip())
    return chunks

def generate_summary(text: str, prompt_suffix: str = "Provide a comprehensive and detailed summary.") -> str:
    """Generate summary using Groq API (fast and free)."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set")
    
    client = Groq(api_key=api_key)
    
    # Determine instructions based on type
    if "brief" in prompt_suffix.lower() or "short" in prompt_suffix.lower():
        instruction = "Output only the summary text with no preamble or meta-commentary. Write 3-5 concise sentences covering the key points."
    elif "detailed" in prompt_suffix.lower():
        instruction = "Output only the summary text with no preamble or meta-commentary. Cover all key points in clear paragraphs."
    elif "exam" in prompt_suffix.lower():
        instruction = "Output only the summary text with no preamble or meta-commentary. Focus on exam-relevant concepts, definitions, and formulas."
    elif "revision" in prompt_suffix.lower():
        instruction = "Output only the summary text with no preamble or meta-commentary. Use bullet points listing the key facts."
    else:
        instruction = "Output only the summary text with no preamble or meta-commentary. Cover the key points clearly."
    
    # For long text, chunk and combine
    if len(text) > 3000:
        chunks = chunk_text(text, max_chars=3000)
        chunk_summaries = []
        
        for chunk in chunks[:3]:  # Limit to 3 chunks for speed
            prompt = f"{instruction}\n\nContent:\n{chunk}"
            
            try:
                response = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {"role": "system", "content": "You are a concise summarizer. Never start your response with phrases like 'Here is', 'Here are', 'This is a summary', or any other preamble. Output only the summary content directly."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=300
                )
                chunk_summaries.append(response.choices[0].message.content.strip())
            except Exception:
                continue
        
        # Combine chunk summaries
        if chunk_summaries:
            combined = "\n\n".join(chunk_summaries)
            return combined
        
        text = text[:3000]  # Fallback to first 3000 chars
    
    # Direct summarization for short text
    prompt = f"{instruction}\n\nContent:\n{text}"
    
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a concise summarizer. Never start your response with phrases like 'Here is', 'Here are', 'This is a summary', or any other preamble. Output only the summary content directly."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=400
    )
    
    return response.choices[0].message.content.strip()
