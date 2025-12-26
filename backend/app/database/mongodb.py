import os
from pymongo import MongoClient

client = None

def get_database():
    global client
    if client is None:
        mongodb_uri = os.getenv("MONGODB_URI")
        if mongodb_uri:
            client = MongoClient(mongodb_uri)
    if client:
        return client["edugen"]
    return None
