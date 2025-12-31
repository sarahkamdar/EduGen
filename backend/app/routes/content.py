from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from typing import Optional
from app.auth.dependencies import get_current_user
from app.models.content import (
    ContentCreate,
    GeneratedOutputCreate,
    create_content,
    get_content_by_id,
    get_user_content,
    create_generated_output,
    get_generated_outputs
)
from app.services.content_processor import process_content
from app.services.summary import generate_summary

router = APIRouter(prefix="/content", tags=["Content"])

@router.post("/upload")
async def upload_content(
    current_user: dict = Depends(get_current_user),
    file: Optional[UploadFile] = File(None),
    youtube_url: Optional[str] = Form(None),
    text: Optional[str] = Form(None)
):
    try:
        input_type, normalized_text = await process_content(file, youtube_url, text)
        
        content_data = ContentCreate(
            user_id=current_user["user_id"],
            input_type=input_type,
            normalized_text=normalized_text
        )
        
        content_id = create_content(content_data)
        
        return {
            "content_id": content_id,
            "normalized_text": normalized_text
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summary")
async def generate_content_summary(
    content_id: str = Form(...),
    summary_type: str = Form("detailed"),
    current_user: dict = Depends(get_current_user)
):
    try:
        content = get_content_by_id(content_id)
        
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        if content["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        summary_prompts = {
            "short": "Provide a brief summary in 3-5 sentences.",
            "detailed": "Provide a comprehensive and detailed summary.",
            "exam": "Provide a summary focused on key exam topics and concepts.",
            "revision": "Provide a summary optimized for quick revision."
        }
        
        prompt_suffix = summary_prompts.get(summary_type, summary_prompts["detailed"])
        summary = generate_summary(content["normalized_text"], prompt_suffix)
        
        output_data = GeneratedOutputCreate(
            user_id=current_user["user_id"],
            content_id=content_id,
            feature="summary",
            options={"summary_type": summary_type},
            output={"summary": summary}
        )
        
        output_id = create_generated_output(output_data)
        
        return {
            "content_id": content_id,
            "summary": summary,
            "summary_type": summary_type,
            "output_id": output_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/flashcards")
async def generate_flashcards(
    content_id: str = Form(...),
    flashcard_type: str = Form("standard"),
    current_user: dict = Depends(get_current_user)
):
    try:
        content = get_content_by_id(content_id)
        
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        if content["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        prompt = f"""Generate flashcards from the following content. Each flashcard should have one concept only. No duplicates. Return as JSON array with 'question' and 'answer' fields.

Content: {content['normalized_text']}"""
        
        from openrouter import OpenRouter
        import os
        import json
        
        client = OpenRouter(api_key=os.getenv("OPENROUTER_API_KEY"))
        
        response = client.chat.completions.create(
            model="deepseek/deepseek-r1",
            messages=[{"role": "user", "content": prompt}]
        )
        
        flashcards_text = response.choices[0].message.content
        
        try:
            flashcards = json.loads(flashcards_text)
        except:
            flashcards = {"raw_response": flashcards_text}
        
        output_data = GeneratedOutputCreate(
            user_id=current_user["user_id"],
            content_id=content_id,
            feature="flashcards",
            options={"flashcard_type": flashcard_type},
            output={"flashcards": flashcards}
        )
        
        output_id = create_generated_output(output_data)
        
        return {
            "content_id": content_id,
            "flashcards": flashcards,
            "output_id": output_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quiz")
async def generate_quiz(
    content_id: str = Form(...),
    number_of_questions: int = Form(10),
    difficulty: str = Form("medium"),
    mode: str = Form("practice"),
    current_user: dict = Depends(get_current_user)
):
    try:
        content = get_content_by_id(content_id)
        
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        if content["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        prompt = f"""Generate a quiz with {number_of_questions} questions from the following content. Difficulty: {difficulty}. Each question must have exactly 4 options with one correct answer. Return as JSON array with 'question', 'options', and 'correct_answer' fields.

Content: {content['normalized_text']}"""
        
        from openrouter import OpenRouter
        import os
        import json
        
        client = OpenRouter(api_key=os.getenv("OPENROUTER_API_KEY"))
        
        response = client.chat.completions.create(
            model="deepseek/deepseek-r1",
            messages=[{"role": "user", "content": prompt}]
        )
        
        quiz_text = response.choices[0].message.content
        
        try:
            quiz = json.loads(quiz_text)
        except:
            quiz = {"raw_response": quiz_text}
        
        output_data = GeneratedOutputCreate(
            user_id=current_user["user_id"],
            content_id=content_id,
            feature="quiz",
            options={
                "number_of_questions": number_of_questions,
                "difficulty": difficulty,
                "mode": mode
            },
            output={"quiz": quiz}
        )
        
        output_id = create_generated_output(output_data)
        
        return {
            "content_id": content_id,
            "quiz": quiz,
            "output_id": output_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/presentation")
async def generate_presentation(
    content_id: str = Form(...),
    max_slides: int = Form(10),
    theme: str = Form("professional"),
    current_user: dict = Depends(get_current_user)
):
    try:
        content = get_content_by_id(content_id)
        
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        if content["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        prompt = f"""Generate a presentation outline with maximum {max_slides} slides. Each slide should have a title and maximum 4 bullet points. No repetition. Return as JSON array with 'title' and 'bullets' fields.

Content: {content['normalized_text']}"""
        
        from openrouter import OpenRouter
        import os
        import json
        
        client = OpenRouter(api_key=os.getenv("OPENROUTER_API_KEY"))
        
        response = client.chat.completions.create(
            model="deepseek/deepseek-r1",
            messages=[{"role": "user", "content": prompt}]
        )
        
        presentation_text = response.choices[0].message.content
        
        try:
            presentation = json.loads(presentation_text)
        except:
            presentation = {"raw_response": presentation_text}
        
        output_data = GeneratedOutputCreate(
            user_id=current_user["user_id"],
            content_id=content_id,
            feature="presentation",
            options={"max_slides": max_slides, "theme": theme},
            output={"presentation": presentation}
        )
        
        output_id = create_generated_output(output_data)
        
        return {
            "content_id": content_id,
            "presentation": presentation,
            "output_id": output_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat_with_content(
    content_id: str = Form(...),
    user_question: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        content = get_content_by_id(content_id)
        
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        if content["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        prompt = f"""You are an AI assistant with access to specific content. Answer the user's question based on the content provided. If the answer is not in the content, clearly state that you're using external knowledge.

Content: {content['normalized_text']}

User Question: {user_question}

Provide a clear and accurate answer."""
        
        from openrouter import OpenRouter
        import os
        
        client = OpenRouter(api_key=os.getenv("OPENROUTER_API_KEY"))
        
        response = client.chat.completions.create(
            model="deepseek/deepseek-r1",
            messages=[{"role": "user", "content": prompt}]
        )
        
        answer = response.choices[0].message.content
        
        output_data = GeneratedOutputCreate(
            user_id=current_user["user_id"],
            content_id=content_id,
            feature="chat",
            options={"user_question": user_question},
            output={"answer": answer}
        )
        
        output_id = create_generated_output(output_data)
        
        return {
            "content_id": content_id,
            "question": user_question,
            "answer": answer,
            "output_id": output_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_content_history(current_user: dict = Depends(get_current_user)):
    try:
        contents = get_user_content(current_user["user_id"])
        
        history = []
        for c in contents:
            history.append({
                "content_id": str(c["_id"]),
                "input_type": c["input_type"],
                "created_at": c["created_at"],
                "preview": c["normalized_text"][:200] + "..." if len(c["normalized_text"]) > 200 else c["normalized_text"]
            })
        
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{content_id}/outputs")
async def get_content_outputs(
    content_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        content = get_content_by_id(content_id)
        
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        if content["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        outputs = get_generated_outputs(content_id, current_user["user_id"])
        
        output_list = []
        for o in outputs:
            output_list.append({
                "output_id": str(o["_id"]),
                "feature": o["feature"],
                "options": o["options"],
                "created_at": o["created_at"]
            })
        
        return {"content_id": content_id, "outputs": output_list}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
