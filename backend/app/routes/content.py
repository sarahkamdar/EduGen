from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form, Request
from fastapi.responses import StreamingResponse
from typing import Optional
from bson import ObjectId
import json
import asyncio
from app.auth.dependencies import get_current_user
from app.database.connection import get_database
from app.models.content import (
    ContentCreate,
    GeneratedOutputCreate,
    create_content,
    get_content_by_id,
    get_user_content,
    create_generated_output,
    get_generated_outputs,
    update_generated_output,
    get_or_create_chatbot_output
)
from app.services.content_processor import process_content, process_content_with_progress
from app.services.summary import generate_summary
from app.services.flashcards import generate_flashcards as create_flashcards
from app.services.quiz import generate_quiz as create_quiz
from app.services.quiz_evaluator import evaluate_quiz
from app.services.chatbot import chat_with_content as chatbot_service
from app.models.quiz_attempt import QuizEvaluationRequest, QuizAttemptCreate, create_quiz_attempt

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
        
        # Generate meaningful title
        title = None
        if file:
            # Use filename without extension
            title = file.filename.rsplit('.', 1)[0][:100] if file.filename else f"{input_type.capitalize()} Document"
        elif youtube_url:
            title = "YouTube Video"
        elif text:
            # Use first 50 chars of text as title
            title = text[:50].strip() + ("..." if len(text) > 50 else "")
        
        if not title:
            title = f"{input_type.capitalize()} Content"
        
        content_data = ContentCreate(
            user_id=current_user["user_id"],
            input_type=input_type,
            normalized_text=normalized_text,
            title=title
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

@router.post("/upload-stream")
async def upload_content_stream(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Upload content with real-time progress updates via Server-Sent Events"""
    
    # Parse multipart form data BEFORE creating the generator
    try:
        form = await request.form()
        file = form.get('file')
        youtube_url = form.get('youtube_url')
        text = form.get('text')
    except Exception as e:
        # Return error immediately if form parsing fails
        async def error_gen():
            error_data = json.dumps({
                "stage": "error",
                "message": f"Request parsing failed: {str(e)}",
                "percentage": 0
            })
            yield f"data: {error_data}\n\n"
        
        return StreamingResponse(
            error_gen(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    
    async def generate_progress():
        # List to collect progress events
        progress_events = []
        
        # Progress callback that collects events
        async def progress_callback(stage: str, message: str, percentage: int):
            progress_events.append({
                "stage": stage,
                "message": message,
                "percentage": percentage
            })
        
        # Process content with progress tracking
        try:
            # Start yielding initial progress
            yield f"data: {json.dumps({'stage': 'start', 'message': 'Starting...', 'percentage': 0})}\n\n"
            
            input_type, normalized_text = await process_content_with_progress(
                file, youtube_url, text, progress_callback
            )
            
            # Yield all collected progress events
            for event in progress_events:
                yield f"data: {json.dumps(event)}\n\n"
                await asyncio.sleep(0.05)
            
            # Generate meaningful title
            title = None
            if file:
                title = file.filename.rsplit('.', 1)[0][:100] if hasattr(file, 'filename') and file.filename else f"{input_type.capitalize()} Document"
            elif youtube_url:
                title = "YouTube Video"
            elif text:
                title = text[:50].strip() + ("..." if len(text) > 50 else "")
            
            if not title:
                title = f"{input_type.capitalize()} Content"
            
            # Save to database
            content_data = ContentCreate(
                user_id=current_user["user_id"],
                input_type=input_type,
                normalized_text=normalized_text,
                title=title
            )
            
            content_id = create_content(content_data)
            
            # Send success event
            success_data = json.dumps({
                "stage": "complete",
                "message": "Content processed successfully!",
                "percentage": 100,
                "content_id": content_id,
                "input_type": input_type
            })
            yield f"data: {success_data}\n\n"
            
        except Exception as e:
            # Send error event
            error_data = json.dumps({
                "stage": "error",
                "message": str(e),
                "percentage": 0
            })
            yield f"data: {error_data}\n\n"
    
    return StreamingResponse(
        generate_progress(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

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
async def generate_flashcards_endpoint(
    content_id: str = Form(...),
    flashcard_type: str = Form("Concept → Definition"),
    number_of_cards: int = Form(10),
    current_user: dict = Depends(get_current_user)
):
    try:
        content = get_content_by_id(content_id)
        
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        if content["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        flashcards = create_flashcards(content['normalized_text'], flashcard_type, number_of_cards)
        
        output_data = GeneratedOutputCreate(
            user_id=current_user["user_id"],
            content_id=content_id,
            feature="flashcards",
            options={"flashcard_type": flashcard_type, "number_of_cards": number_of_cards},
            output=flashcards
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
async def generate_quiz_endpoint(
    content_id: str = Form(...),
    number_of_questions: int = Form(10),
    difficulty: str = Form("Medium"),
    mode: str = Form("Practice"),
    current_user: dict = Depends(get_current_user)
):
    try:
        content = get_content_by_id(content_id)
        
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        if content["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        quiz_data = create_quiz(
            content['normalized_text'],
            max_questions=number_of_questions,
            difficulty_level=difficulty,
            quiz_mode=mode
        )
        
        output_data = GeneratedOutputCreate(
            user_id=current_user["user_id"],
            content_id=content_id,
            feature="quiz",
            options={
                "number_of_questions": number_of_questions,
                "difficulty": difficulty,
                "mode": mode
            },
            output=quiz_data
        )
        
        output_id = create_generated_output(output_data)
        
        return {
            "content_id": content_id,
            "quiz": quiz_data,
            "mode": mode,
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
        
        prompt = f"""Generate presentation outline. Max {max_slides} slides. Each slide: title and max 4 bullet points. No repetition. JSON format: [{{"title": "string", "bullets": ["string"]}}]

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
async def chat_with_content_endpoint(
    content_id: str = Form(...),
    question: str = Form(...),
    chat_history: str = Form(None),
    current_user: dict = Depends(get_current_user)
):
    try:
        import json
        
        content = get_content_by_id(content_id)
        
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        if content["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Parse chat history if provided
        history = []
        if chat_history:
            try:
                parsed_history = json.loads(chat_history)
                # Convert from frontend format (sender/text) to API format (role/content)
                for msg in parsed_history:
                    if msg.get('sender') == 'user':
                        history.append({"role": "user", "content": msg.get('text', '')})
                    elif msg.get('sender') == 'ai':
                        history.append({"role": "assistant", "content": msg.get('text', '')})
            except:
                history = []
        
        # Get AI response
        answer = chatbot_service(
            normalized_text=content['normalized_text'],
            question=question,
            chat_history=history
        )
        
        # Get or create chatbot conversation for this content
        output_id = get_or_create_chatbot_output(content_id, current_user["user_id"])
        
        # Build full conversation history
        full_conversation = []
        
        # Add all previous messages from history if exists
        if chat_history:
            try:
                parsed_history = json.loads(chat_history)
                full_conversation = parsed_history if isinstance(parsed_history, list) else []
            except:
                full_conversation = []
        
        # Add the new question and answer
        full_conversation.append({"sender": "user", "text": question})
        full_conversation.append({"sender": "ai", "text": answer})
        
        # Update the existing conversation
        update_generated_output(output_id, {
            "output": {"conversation": full_conversation},
            "options": {"message_count": len(full_conversation)}
        })
        
        return {
            "content_id": content_id,
            "question": question,
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
                "title": c.get("title") or f"{c['input_type'].capitalize()} Content",
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
                "score": o.get("score"),  # Include quiz score if available
                "created_at": o["created_at"]
            })
        
        return {"content_id": content_id, "outputs": output_list}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quiz/evaluate")
async def evaluate_quiz_attempt(
    quiz_id: str = Form(...),
    content_id: str = Form(...),
    mode: str = Form(...),
    responses: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        import json
        
        if mode not in ["practice", "test"]:
            raise HTTPException(status_code=400, detail="Mode must be 'practice' or 'test'")
        
        try:
            user_responses = json.loads(responses)
        except:
            raise HTTPException(status_code=400, detail="Responses must be valid JSON array")
        
        output = get_content_by_id(quiz_id)
        if not output:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        if output["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        quiz_content = output.get("normalized_text")
        if isinstance(quiz_content, str):
            try:
                quiz_content = json.loads(quiz_content)
            except:
                raise HTTPException(status_code=400, detail="Invalid quiz format")
        
        evaluation_result = evaluate_quiz(
            quiz_content=quiz_content,
            user_responses=user_responses,
            mode=mode,
            user_id=current_user["user_id"],
            quiz_id=quiz_id
        )
        
        attempt_data = QuizAttemptCreate(
            user_id=current_user["user_id"],
            quiz_id=quiz_id,
            content_id=content_id,
            responses=user_responses,
            score=evaluation_result["score"],
            percentage=evaluation_result["percentage"],
            mode=mode
        )
        
        attempt_id = create_quiz_attempt(attempt_data)
        evaluation_result["attempt_id"] = attempt_id
        
        return evaluation_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/output/{output_id}")
async def get_output_by_id(
    output_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        db = get_database()
        generated_outputs = db.generated_outputs
        
        output = generated_outputs.find_one({"_id": ObjectId(output_id)})
        
        if not output:
            raise HTTPException(status_code=404, detail="Output not found")
        
        if output["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            "output_id": str(output["_id"]),
            "content_id": output["content_id"],
            "feature": output["feature"],
            "options": output["options"],
            "output": output["output"],
            "score": output.get("score"),  # Quiz score if available            "user_answers": output.get("user_answers"),  # User answers for test mode            "created_at": output["created_at"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/output/{output_id}/score")
async def update_output_score(
    output_id: str,
    score: int = Form(...),
    total: int = Form(...),
    percentage: int = Form(...),
    user_answers: str = Form(None),
    current_user: dict = Depends(get_current_user)
):
    try:
        db = get_database()
        generated_outputs = db.generated_outputs
        
        output = generated_outputs.find_one({"_id": ObjectId(output_id)})
        
        if not output:
            raise HTTPException(status_code=404, detail="Output not found")
        
        if output["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Prepare update data
        update_data = {"score": {"correct": score, "total": total, "percentage": percentage}}
        
        # If user_answers provided (test mode), parse and store them
        if user_answers:
            import json
            try:
                answers_dict = json.loads(user_answers)
                update_data["user_answers"] = answers_dict
            except json.JSONDecodeError:
                pass  # Skip if invalid JSON
        
        # Update score and user answers
        generated_outputs.update_one(
            {"_id": ObjectId(output_id)},
            {"$set": update_data}
        )
        
        return {"success": True, "output_id": output_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/output/{output_id}")
async def delete_output(
    output_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        db = get_database()
        generated_outputs = db.generated_outputs
        
        output = generated_outputs.find_one({"_id": ObjectId(output_id)})
        
        if not output:
            raise HTTPException(status_code=404, detail="Output not found")
        
        if output["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Delete the output
        generated_outputs.delete_one({"_id": ObjectId(output_id)})
        
        return {"success": True, "message": "Output deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{content_id}/rename")
async def rename_content(
    content_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    try:
        db = get_database()
        content_collection = db.content
        
        # Parse JSON body
        body = await request.json()
        title = body.get('title', '').strip()
        
        if not title:
            raise HTTPException(status_code=400, detail="Title cannot be empty")
        
        content = content_collection.find_one({"_id": ObjectId(content_id)})
        
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        if content["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Update the title
        content_collection.update_one(
            {"_id": ObjectId(content_id)},
            {"$set": {"title": title}}
        )
        
        return {"success": True, "message": "Content renamed successfully", "title": title}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{content_id}")
async def delete_content(
    content_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        db = get_database()
        content_collection = db.content
        generated_outputs = db.generated_outputs
        quiz_attempts = db.quiz_attempts
        
        content = content_collection.find_one({"_id": ObjectId(content_id)})
        
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        if content["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Delete all related outputs
        generated_outputs.delete_many({"content_id": content_id})
        
        # Delete all related quiz attempts
        quiz_attempts.delete_many({"content_id": content_id})
        
        # Delete the content itself
        content_collection.delete_one({"_id": ObjectId(content_id)})
        
        return {"success": True, "message": "Content and all related data deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
