from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.database.connection import get_database

class ContentCreate(BaseModel):
    user_id: str
    input_type: str
    normalized_text: str
    title: Optional[str] = None

class GeneratedOutputCreate(BaseModel):
    user_id: str
    content_id: str
    feature: str
    options: dict
    output: dict

def create_content(content_data: ContentCreate) -> str:
    db = get_database()
    content_collection = db.content
    
    content_doc = {
        "user_id": content_data.user_id,
        "input_type": content_data.input_type,
        "normalized_text": content_data.normalized_text,
        "title": content_data.title,
        "created_at": datetime.utcnow()
    }
    
    result = content_collection.insert_one(content_doc)
    return str(result.inserted_id)

def get_content_by_id(content_id: str) -> Optional[dict]:
    db = get_database()
    content_collection = db.content
    
    try:
        content = content_collection.find_one({"_id": ObjectId(content_id)})
        return content
    except:
        return None

def get_user_content(user_id: str) -> list:
    db = get_database()
    content_collection = db.content
    
    contents = list(content_collection.find({"user_id": user_id}).sort("created_at", -1))
    return contents

def create_generated_output(output_data: GeneratedOutputCreate) -> str:
    db = get_database()
    generated_outputs = db.generated_outputs
    
    output_doc = {
        "user_id": output_data.user_id,
        "content_id": output_data.content_id,
        "feature": output_data.feature,
        "options": output_data.options,
        "output": output_data.output,
        "created_at": datetime.utcnow()
    }
    
    result = generated_outputs.insert_one(output_doc)
    return str(result.inserted_id)

def get_generated_outputs(content_id: str, user_id: str) -> list:
    db = get_database()
    generated_outputs = db.generated_outputs
    
    outputs = list(generated_outputs.find({
        "content_id": content_id,
        "user_id": user_id
    }).sort("created_at", -1))
    
    return outputs

def update_generated_output(output_id: str, output_data: dict) -> bool:
    """Update an existing generated output"""
    db = get_database()
    generated_outputs = db.generated_outputs
    
    result = generated_outputs.update_one(
        {"_id": ObjectId(output_id)},
        {"$set": {
            "output": output_data["output"],
            "options": output_data["options"],
            "updated_at": datetime.utcnow()
        }}
    )
    
    return result.modified_count > 0

def get_or_create_chatbot_output(content_id: str, user_id: str) -> str:
    """Get existing chatbot conversation or create a new one"""
    db = get_database()
    generated_outputs = db.generated_outputs
    
    # Find existing chatbot conversation for this content
    existing = generated_outputs.find_one({
        "content_id": content_id,
        "user_id": user_id,
        "feature": "chatbot"
    })
    
    if existing:
        return str(existing["_id"])
    
    # Create new chatbot conversation
    output_doc = {
        "user_id": user_id,
        "content_id": content_id,
        "feature": "chatbot",
        "options": {"message_count": 0},
        "output": {"conversation": []},
        "created_at": datetime.utcnow()
    }
    
    result = generated_outputs.insert_one(output_doc)
    return str(result.inserted_id)
