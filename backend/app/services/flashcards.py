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

def generate_flashcards(normalized_text: str, flashcard_type: str = "Concept → Definition") -> dict:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable not set")
    
    prompt = FLASHCARD_PROMPT.format(
        normalized_text=normalized_text,
        flashcard_type=flashcard_type
    )
    
    with OpenRouter(api_key=api_key) as client:
        response = client.chat.send(
            model="deepseek/deepseek-r1-0528:free",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        result_text = response.choices[0].message.content
        
        try:
            flashcards = json.loads(result_text)
            return flashcards
        except json.JSONDecodeError:
            return {"flashcards": [], "raw_response": result_text}
