from openrouter import OpenRouter
import os
import json
from dotenv import load_dotenv

load_dotenv()

def get_quiz_prompt(normalized_text: str, max_questions: int, difficulty_level: str, quiz_mode: str) -> str:
    """Generate the quiz prompt with proper mode-specific instructions."""
    mode_instruction = "Include brief explanations for each answer" if quiz_mode == "Practice" else "Set explanation to empty string"
    
    return f"""Create {max_questions} MCQ questions from this content. Difficulty: {difficulty_level}. Mode: {quiz_mode}.

Content:
{normalized_text}

Rules:
- 4 options (A-D), 1 correct
- Test different concepts
- {mode_instruction}
- JSON format only

Output:
{{{{
  "quiz": [
    {{{{
      "id": 1,
      "question": "...",
      "options": {{{{"A": "...", "B": "...", "C": "...", "D": "..."}}}},
      "correct_answer": "A",
      "explanation": "..."
    }}}}
  ]
}}}}"""

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
    
    # More aggressive content truncation to ensure response fits
    # Free tier models have ~4000 token limit total (input + output)
    # Reserve more space for output based on question count
    
    # Calculate tokens needed for output
    # Each question needs ~250-350 tokens (question + 4 options + explanation)
    tokens_per_question = 350 if quiz_mode == "Practice" else 250
    output_tokens_needed = max_questions * tokens_per_question + 200  # +200 buffer
    
    # Max input tokens should leave room for output
    max_input_tokens = max(1000, 3500 - output_tokens_needed)
    
    # Rough conversion: 1 token ≈ 4 characters
    max_content_chars = max_input_tokens * 4
    
    # Further reduce for smaller question counts to be safe
    if max_questions <= 5:
        max_content_chars = min(max_content_chars, 2500)
    elif max_questions <= 7:
        max_content_chars = min(max_content_chars, 2000)
    else:
        max_content_chars = min(max_content_chars, 1500)
    
    if len(normalized_text) > max_content_chars:
        print(f"WARNING: Content too long ({len(normalized_text)} chars), truncating to {max_content_chars} chars")
        # Try to truncate at sentence boundary
        truncated = normalized_text[:max_content_chars]
        last_period = truncated.rfind('.')
        if last_period > max_content_chars * 0.8:  # If period is in last 20%
            normalized_text = truncated[:last_period + 1]
        else:
            normalized_text = truncated + "..."
    
    print(f"Quiz - Input text length: {len(normalized_text)}")
    print(f"Quiz - Requested questions: {max_questions}")
    print(f"Quiz - Max output tokens: {output_tokens_needed}")
    
    prompt = get_quiz_prompt(normalized_text, max_questions, difficulty_level, quiz_mode)
    
    print(f"Quiz - Full prompt length: {len(prompt)} chars")
    
    # Set max_tokens for response
    max_tokens = min(6000, output_tokens_needed)
    
    print(f"Quiz - Using max_tokens: {max_tokens}")
    
    try:
        with OpenRouter(api_key=api_key) as client:
            response = client.chat.send(
                model="deepseek/deepseek-r1-0528:free",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.7
            )
            
            # Check if response exists
            if not response or not response.choices:
                print("ERROR: No response choices from OpenRouter")
                return {"quiz": [], "raw_response": "No response from AI model"}
            
            # Get the message content
            message = response.choices[0].message
            result_text = message.content if hasattr(message, 'content') else ""
            finish_reason = response.choices[0].finish_reason if hasattr(response.choices[0], 'finish_reason') else 'unknown'
            
            # Log for debugging
            print(f"Quiz - Finish reason: {finish_reason}")
            print(f"Quiz - Raw response length: {len(result_text) if result_text else 0}")
            
            # Check if response is empty
            if not result_text or result_text.strip() == "":
                print(f"ERROR: Empty response from OpenRouter. Finish reason: {finish_reason}")
                
                # If content filter or length issue
                if finish_reason == 'content_filter':
                    return {"quiz": [], "raw_response": "Content filtered by AI model"}
                elif finish_reason == 'length':
                    return {"quiz": [], "raw_response": f"Response truncated. Reduce questions to {max(3, max_questions // 2)}."}
                else:
                    return {"quiz": [], "raw_response": f"Empty response from AI model (finish_reason: {finish_reason})"}
            
            # Check if response was cut off due to length
            if finish_reason == 'length':
                print(f"WARNING: Response truncated due to length limit")
                return {"quiz": [], "raw_response": f"Response cut off. Try {max(3, max_questions // 2)} questions instead of {max_questions}."}
            
            print(f"Quiz - Raw response preview: {result_text[:200]}...")
            
            # Clean the response
            cleaned_text = clean_json_response(result_text)
            
            print(f"Quiz - Cleaned text length: {len(cleaned_text)}")
            print(f"Quiz - Cleaned text preview: {cleaned_text[:200]}...")
            
            try:
                quiz_data = json.loads(cleaned_text)
                questions = quiz_data.get('quiz', [])
                
                if len(questions) == 0:
                    return {"quiz": [], "raw_response": "AI generated empty quiz. Try 5 questions with shorter content."}
                
                print(f"Quiz - Successfully parsed {len(questions)} questions")
                return quiz_data
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                print(f"Cleaned text: {cleaned_text[:500]}...")
                
                # Provide helpful error message
                error_msg = f"Failed to parse AI response. Try with {max(3, max_questions // 2)} questions."
                
                return {"quiz": [], "raw_response": error_msg + f"\n\nPartial response: {result_text[:200]}..."}
    except Exception as e:
        print(f"Quiz generation error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"quiz": [], "raw_response": f"Error: {str(e)}"}
