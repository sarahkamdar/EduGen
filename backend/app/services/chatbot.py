from openrouter import OpenRouter
import os
from dotenv import load_dotenv

load_dotenv()

def chat_with_content(normalized_text: str, question: str, chat_history: list = None) -> str:
    """
    Chat with content using AI model.
    
    Args:
        normalized_text: The source content/transcript
        question: User's question
        chat_history: Optional list of previous messages [{"role": "user/assistant", "content": "..."}]
    
    Returns:
        str: AI response
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable not set")
    
    # Truncate content if too long (keep first 4000 chars)
    if len(normalized_text) > 4000:
        print(f"WARNING: Content too long ({len(normalized_text)} chars), truncating to 4000 chars")
        normalized_text = normalized_text[:4000] + "..."
    
    print(f"Chatbot - Content length: {len(normalized_text)}")
    print(f"Chatbot - Question: {question}")
    
    # Build system message with content context
    system_message = f"""You are a helpful educational assistant. Answer questions based ONLY on the provided content.

Content:
{normalized_text}

Instructions:
- Answer based on the content above in plain conversational text
- Be concise and clear
- Do NOT use markdown headers (no # symbols)
- Do NOT use excessive punctuation or special characters
- Use simple bullet points (- or •) for lists only when necessary
- Write in natural, readable sentences
- If the answer is not in the content, say "I cannot find this information in the provided content."
- Quote relevant parts when helpful using regular quotes"""
    
    # Build messages array
    messages = [{"role": "system", "content": system_message}]
    
    # Add chat history if provided (last 5 exchanges to keep context manageable)
    if chat_history:
        messages.extend(chat_history[-10:])  # Last 10 messages (5 exchanges)
    
    # Add current question
    messages.append({"role": "user", "content": question})
    
    print(f"Chatbot - Total messages in context: {len(messages)}")
    
    try:
        with OpenRouter(api_key=api_key) as client:
            response = client.chat.send(
                model="deepseek/deepseek-r1-0528:free",
                messages=messages,
                max_tokens=2500,
                temperature=0.7
            )
            
            if not response or not response.choices:
                print("ERROR: No response from OpenRouter")
                return "Sorry, I couldn't generate a response. Please try again."
            
            message = response.choices[0].message
            result_text = message.content if hasattr(message, 'content') else ""
            
            # Check if response was truncated
            finish_reason = response.choices[0].finish_reason if hasattr(response.choices[0], 'finish_reason') else None
            print(f"Chatbot - Finish reason: {finish_reason}")
            
            if not result_text or result_text.strip() == "":
                return "Sorry, I received an empty response. Please try again."
            
            print(f"Chatbot - Response length: {len(result_text)}")
            
            # If response was cut due to length, add indicator
            if finish_reason == "length":
                result_text += "\n\n[Response truncated due to length. Please ask a more specific question.]"
            
            return result_text.strip()
            
    except Exception as e:
        print(f"Chatbot error: {str(e)}")
        import traceback
        traceback.print_exc()
        return f"Error: {str(e)}"
