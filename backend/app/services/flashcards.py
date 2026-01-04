from openrouter import OpenRouter
import os
import json
from dotenv import load_dotenv

load_dotenv()

FLASHCARD_PROMPT = """Generate learning flashcards from educational content.

INPUT:
Content: {normalized_text}
Template: {flashcard_type}

TEMPLATES:
- Concept to Definition
- Why to Explanation
- How to Steps
- Term to Example
- Question to Answer

RULES:
- One unique idea per flashcard
- No repeated or paraphrased concepts
- Simple student-friendly language
- Concise clear explanations
- Use only source content
- No external information

QUALITY:
- Important concepts over trivial facts
- Useful for learning and exams
- Clear logical explanations
- No filler sentences

OUTPUT FORMAT (JSON only):
{{
  "flashcards": [
    {{"front": "string", "back": "string"}}
  ]
}}

TEMPLATE STRUCTURE:
Concept Definition: Front=concept name, Back=simple definition
Why Explanation: Front=why question, Back=logical explanation
How Steps: Front=process, Back=step-wise paragraph
Term Example: Front=term, Back=practical example
Question Answer: Front=question, Back=direct answer

FORBIDDEN:
- Repeating concepts
- Mixing templates
- Bullet points or markdown
- External knowledge
- Any text outside JSON"""

def clean_json_response(text: str) -> str:
    """Extract JSON from markdown code blocks and clean response."""
    # Remove markdown code blocks
    text = text.strip()
    
    # Remove ```json and ``` markers
    if text.startswith('```'):
        # Find the first newline after opening ```
        first_newline = text.find('\n')
        if first_newline != -1:
            text = text[first_newline + 1:]
        else:
            text = text[3:]  # Remove ```
    
    if text.endswith('```'):
        text = text[:-3]
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    # Try to extract JSON object if response contains extra text
    if '{' in text and '}' in text:
        start = text.find('{')
        # Find matching closing brace
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

def generate_flashcards(normalized_text: str, flashcard_type: str = "Concept → Definition") -> dict:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable not set")
    
    prompt = FLASHCARD_PROMPT.format(
        normalized_text=normalized_text,
        flashcard_type=flashcard_type
    )
    
    try:
        with OpenRouter(api_key=api_key) as client:
            response = client.chat.send(
                model="deepseek/deepseek-r1-0528:free",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=4000  # Increased to allow longer responses
            )
            
            result_text = response.choices[0].message.content
            
            # Log for debugging
            print(f"Flashcards - Raw response length: {len(result_text)}")
            print(f"Flashcards - Raw response preview: {result_text[:200]}...")
            
            # Check if response is empty
            if not result_text or result_text.strip() == "":
                print("ERROR: Empty response from OpenRouter")
                return {"flashcards": [], "raw_response": "Empty response from AI model"}
            
            # Clean the response
            cleaned_text = clean_json_response(result_text)
            
            print(f"Flashcards - Cleaned text length: {len(cleaned_text)}")
            print(f"Flashcards - Cleaned text preview: {cleaned_text[:200]}...")
            
            try:
                flashcards = json.loads(cleaned_text)
                print(f"Flashcards - Successfully parsed {len(flashcards.get('flashcards', []))} cards")
                return flashcards
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                print(f"Cleaned text: {cleaned_text[:500]}...")
                return {"flashcards": [], "raw_response": result_text}
    except Exception as e:
        print(f"Flashcards generation error: {str(e)}")
        return {"flashcards": [], "raw_response": f"Error: {str(e)}"}
