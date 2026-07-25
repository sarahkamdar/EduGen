from datetime import datetime

import bcrypt
from app.database.connection import get_users_collection
from bson import ObjectId
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

    class Config:
        json_encoders = {
            ObjectId: str
        }

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_user(user_data: UserCreate) -> str | None:
    users_collection = get_users_collection()

    existing_user = users_collection.find_one({"email": user_data.email.lower()})
    if existing_user:
        return None

    user_doc = {
        "name": user_data.name,
        "email": user_data.email.lower(),
        "hashed_password": hash_password(user_data.password),
        "created_at": datetime.utcnow()
    }

    result = users_collection.insert_one(user_doc)
    return str(result.inserted_id)

def get_user_by_email(email: str) -> dict | None:
    users_collection = get_users_collection()
    user = users_collection.find_one({"email": email.lower()})
    return user

def get_user_by_id(user_id: str) -> dict | None:
    users_collection = get_users_collection()
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    return user
