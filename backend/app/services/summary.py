from openrouter import OpenRouter
import os
from dotenv import load_dotenv

load_dotenv()

def generate_summary(transcript: str, prompt_suffix: str = "Provide a comprehensive and detailed summary.") -> str:
    """Generate summary using OpenRouter LLM."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable not set")
    
    with OpenRouter(api_key=api_key) as client:
        response = client.chat.send(
            model="deepseek/deepseek-r1-0528:free",
            messages=[
                {"role": "user", "content": f"Summarize this content. {prompt_suffix}\n\nContent: {transcript}"}
            ]
        )
        
        return response.choices[0].message.content
