from transformers import pipeline

qa_pipeline = None

def generate_chat_response(
    question: str,
    transcript: str,
    summary: str,
    key_points: list[str]
) -> str:
    """Generate answer to question using context from video content."""
    global qa_pipeline
    if qa_pipeline is None:
        qa_pipeline = pipeline("question-answering", model="distilbert-base-cased-distilled-squad")
    
    context = summary + " " + " ".join(key_points)
    
    result = qa_pipeline(question=question, context=context)
    return result['answer']
