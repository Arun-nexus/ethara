from fastapi import APIRouter, Depends
from models.schemas import UserCreate, UserLogin, TokenResponse, UserOut
from services.auth_service import register_user, login_user, create_access_token
from middleware.db import get_db
from middleware.auth_guard import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(body: UserCreate, db=Depends(get_db)):
    """Register new user → returns JWT token immediately"""
    user  = await register_user(body.model_dump(), db)
    token = create_access_token(user["_id"], user["role"])
    return {
        "access_token": token,
        "user": UserOut(id=user["_id"], name=user["name"],
                        email=user["email"], role=user["role"])
    }


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin, db=Depends(get_db)):
    """Login → returns JWT token"""
    user  = await login_user(body.email, body.password, db)
    token = create_access_token(user["_id"], user["role"])
    return {
        "access_token": token,
        "user": UserOut(id=user["_id"], name=user["name"],
                        email=user["email"], role=user["role"])
    }


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Returns currently logged-in user info"""
    return UserOut(
        id=current_user["_id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"]
    )
