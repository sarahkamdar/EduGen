from groq import Groq
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

def chunk_text(text: str, max_chars: int = 800) -> list:
    """Split text into smaller chunks by sentences."""
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

FLASHCARD_PROMPT = """Create EXACTLY {num_cards} flashcards. Type: {flashcard_type}

{normalized_text}

Return ONLY JSON:
{{"flashcards": [{{"front": "...", "back": "..."}}]}}"""

def clean_json_response(text: str) -> str:
    """Extract JSON from markdown code blocks."""
    text = text.strip()
    
    if text.startswith('```'):
        first_newline = text.find('\n')
        if first_newline != -1:
            text = text[first_newline + 1:]
        else:
            text = text[3:]
    
    if text.endswith('```'):
        text = text[:-3]
    
    text = text.strip()
    
    if '{' in text and '}' in text:
        start = text.find('{')
        brace_count = 0
        end = -1
        for i in range(start, len(text)):
            if text[i] == '{':
                brace_count += 1
            elif text[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end = i + 1
                    break
        
        if end != -1:
            text = text[start:end]
    
    return text

def generate_flashcards(normalized_text: str, flashcard_type: str = "Concept → Definition", num_cards: int = 10) -> dict:
    """Generate EXACTLY the requested number of flashcards."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set")
    
    client = Groq(api_key=api_key)
    
    # For 5 or fewer cards, use single request
    if num_cards <= 5 or len(normalized_text) <= 1000:
        prompt = FLASHCARD_PROMPT.format(
            normalized_text=normalized_text[:1000],
            flashcard_type=flashcard_type,
            num_cards=num_cards
        )
        
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=400
            )
            
            cleaned = clean_json_response(response.choices[0].message.content)
            cards_data = json.loads(cleaned)
            cards = cards_data.get('flashcards', [])
            
            return {"flashcards": cards[:num_cards]}
        except Exception as e:
            return {"flashcards": [], "error": str(e)}
    
    # For more cards, split across chunks
    chunks = chunk_text(normalized_text, max_chars=800)
    cards_per_chunk = max(2, num_cards // min(len(chunks), 3))
    chunks_to_use = min(len(chunks), 3)
    
    all_flashcards = []
    
    for i in range(chunks_to_use):
        if len(all_flashcards) >= num_cards:
            break
            
        needed = num_cards - len(all_flashcards)
        num = min(cards_per_chunk, needed)
        
        prompt = FLASHCARD_PROMPT.format(
            normalized_text=chunks[i],
            flashcard_type=flashcard_type,
            num_cards=num
        )
        
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=400
            )
            
            result_text = response.choices[0].message.content
            
            if result_text and result_text.strip():
                cleaned_text = clean_json_response(result_text)
                
                try:
                    chunk_cards = json.loads(cleaned_text)
                    cards = chunk_cards.get('flashcards', [])
                    all_flashcards.extend(cards[:num])
                except json.JSONDecodeError:
                    continue
                    
        except Exception as e:
            print(f"Chunk {i} error: {e}")
            continue
    
    return {"flashcards": all_flashcards[:num_cards]}
