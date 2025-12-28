def generate_flashcards(summary: str, key_points: list[str]) -> list[dict]:
    """Generate flashcards from summary and key points."""
    flashcards = []
    
    summary_sentences = [s.strip() for s in summary.split('.') if s.strip() and len(s.strip()) > 20]
    
    for i, sentence in enumerate(summary_sentences[:5]):
        words = sentence.split()
        if len(words) > 5:
            question = f"What is mentioned about {' '.join(words[:3]).lower()}"
            answer = sentence
            flashcards.append({"question": question, "answer": answer})
    
    for i, point in enumerate(key_points[:5]):
        if point and len(point) > 15:
            words = point.split()
            if len(words) > 3:
                question = f"Explain the concept of {' '.join(words[:3]).lower()}"
                answer = point
                flashcards.append({"question": question, "answer": answer})
    
    return flashcards[:10]
