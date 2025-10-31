import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """
    AIDIT Configuration Settings
    
    Loads from environment variables with sensible defaults for development.
    See .env.example for full configuration options.
    
    Secret Categories:
    - Team Secrets: DB, Redis, S3, Stripe, JWT, SMTP
    - User Secrets: Gaming APIs, AI/ML APIs, Analytics
    """
    
    # ============================================
    # Feature Flags
    # ============================================
    USE_POSTGRES: bool = False
    USE_OBJECT_STORAGE: bool = False
    USE_HIGHLIGHT_MODEL: bool = False

    # ============================================
    # Freemium Configuration
    # ============================================
    FREEMIUM_MAX_DURATION: int = 60
    WATERMARK_TEXT: str = "Aiditor Free"

    # ============================================
    # Database Configuration (Team Secret)
    # ============================================
    POSTGRES_DSN: str = "postgresql+psycopg://postgres:postgres@postgres:5432/aiditor"
    DB_PATH: str = "/app/storage/db.sqlite3"

    # ============================================
    # Storage Configuration (Team Secret)
    # ============================================
    # Local storage
    STORAGE_ROOT: str = "/app/storage"
    
    # S3/MinIO object storage
    S3_ENDPOINT_URL: str = "http://minio:9000"
    S3_REGION: str = "us-east-1"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "aiditor"
    S3_PUBLIC_BASE_URL: str = "http://localhost:9000/aiditor"

    # ============================================
    # Broker Configuration (Team Secret)
    # ============================================
    REDIS_URL: str = "redis://redis:6379/0"

    # ============================================
    # Billing & Payments (Team Secret)
    # ============================================
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_PRO_PRICE_ID: Optional[str] = None

    # ============================================
    # Authentication & Security (Team Secret)
    # ============================================
    JWT_SECRET_KEY: Optional[str] = None
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    SESSION_SECRET: Optional[str] = None

    # ============================================
    # Gaming Platform APIs (User Secret)
    # ============================================
    STEAM_API_KEY: Optional[str] = None
    STEAM_WEB_API_KEY: Optional[str] = None
    XBOX_CLIENT_ID: Optional[str] = None
    XBOX_CLIENT_SECRET: Optional[str] = None
    PSN_NPSSO_TOKEN: Optional[str] = None
    NINTENDO_SESSION_TOKEN: Optional[str] = None

    # ============================================
    # AI/ML Services (User Secret)
    # ============================================
    OPENAI_API_KEY: Optional[str] = None
    WHISPER_MODEL_PATH: str = "/app/models/whisper"

    # ============================================
    # Email/Notifications (Team Secret)
    # ============================================
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@aiditor.com"

    # ============================================
    # Monitoring & Analytics (Team Secret)
    # ============================================
    SENTRY_DSN: Optional[str] = None
    ANALYTICS_API_KEY: Optional[str] = None

    # ============================================
    # Development/Debug
    # ============================================
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()  # reads from env
