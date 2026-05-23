from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):

    MONGODB_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "taskflow"

    JWT_SECRET: str = "your-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 

    APP_NAME: str = "TaskFlow"
    DEBUG: bool = False
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
