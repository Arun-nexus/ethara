from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, status
import uuid
from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {
        "sub":  user_id,
        "role": role,
        "exp":  expire,
        "iat":  datetime.utcnow()
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


async def register_user(user_data: dict, db) -> dict:
    existing = await db.users.find_one({"email": user_data["email"]})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user_id = str(uuid.uuid4())
    doc = {
        "_id":        user_id,
        "name":       user_data["name"],
        "email":      user_data["email"],
        "password":   hash_password(user_data["password"]),
        "role":       user_data.get("role", "member"),
        "created_at": datetime.utcnow()
    }
    await db.users.insert_one(doc)
    return doc


async def login_user(email: str, password: str, db) -> dict:
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    return user
