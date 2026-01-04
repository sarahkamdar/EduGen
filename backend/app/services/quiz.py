from openrouter import OpenRouter
import os
import json
from dotenv import load_dotenv

load_dotenv()

QUIZ_PROMPT = """Generate auto-gradable MCQ quiz from educational content.

INPUT:
Content: {normalized_text}
Max Questions: {max_questions}
Difficulty: {difficulty_level}
Mode: {quiz_mode}

RULES:
- Total questions must not exceed {max_questions}
- Each question tests different concept
- No repeated ideas or facts
- Assess understanding not memorization
- Use only source content information
- Clear academic language

DIFFICULTY:
Easy: Direct definitions and facts
Medium: Conceptual reasoning and comparisons
Hard: Multi-step reasoning and subtle distinctions

STRUCTURE:
- Exactly 4 options per question
- Exactly 1 correct answer matching an option
- Plausible distractors
- No "All/None of the above"
- No repeated option text

MODE:
Practice: Include correct answer and brief explanation
Test: Include correct answer with empty explanation string

OUTPUT FORMAT (JSON only):
{{
  "quiz": [
    {{
      "id": 1,
      "question": "string",
      "options": {{"A": "string", "B": "string", "C": "string", "D": "string"}},
      "correct_answer": "A",
      "explanation": "string or empty"
    }}
  ]
}}

FORBIDDEN:
- Multiple correct answers
- Answer not in options
- Repeated concepts
- Ambiguous wording
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

def generate_quiz(
    normalized_text: str,
    max_questions: int = 10,
    difficulty_level: str = "Medium",
    quiz_mode: str = "Practice"
) -> dict:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable not set")
    
    # Truncate content if too long (keep first 6000 chars to leave room for quiz generation)
    if len(normalized_text) > 6000:
        print(f"WARNING: Content too long ({len(normalized_text)} chars), truncating to 6000 chars")
        normalized_text = normalized_text[:6000] + "..."
    
    print(f"Quiz - Input text length: {len(normalized_text)}")
    
    prompt = QUIZ_PROMPT.format(
        normalized_text=normalized_text,
        max_questions=max_questions,
        difficulty_level=difficulty_level,
        quiz_mode=quiz_mode
    )
    
    print(f"Quiz - Full prompt length: {len(prompt)}")
    
    try:
        with OpenRouter(api_key=api_key) as client:
            response = client.chat.send(
                model="deepseek/deepseek-r1-0528:free",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=4000,  # Increased to allow longer responses
                temperature=0.7
            )
            
            # Check if response exists
            if not response or not response.choices:
                print("ERROR: No response choices from OpenRouter")
                return {"quiz": [], "raw_response": "No response from AI model"}
            
            # Get the message content
            message = response.choices[0].message
            result_text = message.content if hasattr(message, 'content') else ""
            
            # Log for debugging
            print(f"Quiz - Response object: {response}")
            print(f"Quiz - Message: {message}")
            print(f"Quiz - Raw response length: {len(result_text) if result_text else 0}")
            
            # Check if response is empty
            if not result_text or result_text.strip() == "":
                # Check for finish_reason or other metadata
                finish_reason = response.choices[0].finish_reason if hasattr(response.choices[0], 'finish_reason') else 'unknown'
                print(f"ERROR: Empty response from OpenRouter. Finish reason: {finish_reason}")
                
                # If content filter or length issue
                if finish_reason == 'content_filter':
                    return {"quiz": [], "raw_response": "Content filtered by AI model"}
                elif finish_reason == 'length':
                    return {"quiz": [], "raw_response": "Response truncated due to length. Try fewer questions."}
                else:
                    return {"quiz": [], "raw_response": f"Empty response from AI model (finish_reason: {finish_reason})"}
            
            print(f"Quiz - Raw response preview: {result_text[:200]}...")
            
            # Clean the response
            cleaned_text = clean_json_response(result_text)
            
            print(f"Quiz - Cleaned text length: {len(cleaned_text)}")
            print(f"Quiz - Cleaned text preview: {cleaned_text[:200]}...")
            
            try:
                quiz_data = json.loads(cleaned_text)
                print(f"Quiz - Successfully parsed {len(quiz_data.get('quiz', []))} questions")
                return quiz_data
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                print(f"Cleaned text: {cleaned_text[:500]}...")
                return {"quiz": [], "raw_response": result_text}
    except Exception as e:
        print(f"Quiz generation error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"quiz": [], "raw_response": f"Error: {str(e)}"}
