def generate_quiz(summary: str, key_points: list[str]) -> list[dict]:
    """Generate MCQ quiz from summary and key points."""
    quiz = []
    
    summary_sentences = [s.strip() for s in summary.split('.') if s.strip() and len(s.strip()) > 20]
    
    for i, sentence in enumerate(summary_sentences[:4]):
        words = sentence.split()
        if len(words) > 5:
            question = f"What is the main idea about {' '.join(words[:3]).lower()}"
            correct = sentence
            wrong1 = f"This is not related to {' '.join(words[:2]).lower()}"
            wrong2 = f"Incorrect statement about {words[0].lower()}"
            wrong3 = f"This does not describe {words[1].lower()}"
            
            quiz.append({
                "question": question,
                "options": [correct, wrong1, wrong2, wrong3],
                "correct_answer": correct
            })
    
    for i, point in enumerate(key_points[:4]):
        if point and len(point) > 15:
            words = point.split()
            if len(words) > 3:
                question = f"Which statement describes {' '.join(words[:2]).lower()}"
                correct = point
                wrong1 = f"Opposite of {words[0].lower()}"
                wrong2 = f"Unrelated to {words[1].lower()}"
                wrong3 = f"Different concept than {words[2].lower()}"
                
                quiz.append({
                    "question": question,
                    "options": [correct, wrong1, wrong2, wrong3],
                    "correct_answer": correct
                })
    
    return quiz[:8]
