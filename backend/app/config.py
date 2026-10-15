import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AccessAble AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security & Tokens
    SECRET_KEY: str = os.getenv("SECRET_KEY", "accessable_ai_super_secret_jwt_key_2026_production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./accessable.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://accessable.ai",
        "capacitor://localhost",
        "http://localhost",
    ]
    
    # AI Integration (Optional Gemini / OpenAI key)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Scanner Limits
    SCAN_TIMEOUT_SECONDS: int = 30
    MAX_RESPONSE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
