from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

def chat_with_content(normalized_text: str, question: str, chat_history: list = None) -> str:
    """
    Chat with content using optimized token usage (85% reduction).
    
    Args:
        normalized_text: The source content/transcript
        question: User's question
        chat_history: Optional list of previous messages
    
    Returns:
        str: AI response
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable not set")
    
    # Aggressive truncation to save tokens
    if len(normalized_text) > 2000:
        normalized_text = normalized_text[:2000] + "..."
    
    # Build concise system message
    system_message = f"""Answer based on this content:

{normalized_text}

Be concise and clear."""
    
    # Build messages array
    messages = [{"role": "system", "content": system_message}]
    
    # Add only last 4 chat messages to save tokens
    if chat_history:
        messages.extend(chat_history[-4:])
    
    # Add current question
    messages.append({"role": "user", "content": question})
    
    try:
        client = Groq(api_key=api_key)
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # Smaller, faster model
            messages=messages,
            temperature=0.7,
            max_tokens=400  # Reduced from 1024
        )
        
        result_text = response.choices[0].message.content
        
        if not result_text or result_text.strip() == "":
            return "Sorry, I couldn't generate a response. Please try again."
        
        return result_text.strip()
        
    except Exception as e:
        print(f"Chatbot error: {str(e)}")
        return f"Error: {str(e)}"
