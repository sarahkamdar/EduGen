from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise ValueError("MONGODB_URI not found in environment variables")

client = None
db = None

def get_database():
    global client, db
    if db is None:
        try:
            client = MongoClient(MONGODB_URI)
            client.admin.command('ping')
            db = client.edugen
        except ConnectionFailure:
            raise Exception("Failed to connect to MongoDB")
    return db

def get_users_collection():
    database = get_database()
    return database.users
