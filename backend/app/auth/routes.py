from fastapi import APIRouter, HTTPException, status
from app.models.user import UserCreate, UserLogin, create_user, get_user_by_email, verify_password
from app.auth.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup")
async def signup(user: UserCreate):
    user_id = create_user(user)
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    return {"message": "User created successfully"}

@router.post("/login")
async def login(user: UserLogin):
    db_user = get_user_by_email(user.email)
    
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    access_token = create_access_token(
        data={
            "user_id": str(db_user["_id"]),
            "email": db_user["email"]
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
