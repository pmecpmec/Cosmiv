import os
from pydantic_settings import BaseSettings
from typing import List
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"  # development, staging, production

    # Token encryption for OAuth tokens
    ENCRYPTION_KEY: str = ""

    # Feature flags
    USE_POSTGRES: bool = False
    USE_OBJECT_STORAGE: bool = False
    USE_HIGHLIGHT_MODEL: bool = False
    HIGHLIGHT_DETECTOR: str = "heuristic"

    # Freemium
    FREEMIUM_MAX_DURATION: int = 60
    WATERMARK_TEXT: str = "Cosmiv Free"

    # Rendering
    ENABLE_NVENC: bool = True

    # DB
    # ⚠️ SECURITY: Development defaults only. Override via environment variables in production!
    POSTGRES_DSN: str = os.getenv(
        "POSTGRES_DSN", "postgresql+psycopg://postgres:CHANGEME@postgres:5432/cosmiv"
    )
    DB_PATH: str = os.getenv("DB_PATH", "/app/storage/db.sqlite3")

    # Storage (S3/MinIO)
    # ⚠️ SECURITY: These are development defaults. Override via environment variables in production!
    S3_ENDPOINT_URL: str = os.getenv("S3_ENDPOINT_URL", "http://minio:9000")
    S3_REGION: str = os.getenv("S3_REGION", "us-east-1")
    S3_ACCESS_KEY: str = os.getenv("S3_ACCESS_KEY", "minioadmin")
    S3_SECRET_KEY: str = os.getenv("S3_SECRET_KEY", "minioadmin")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "cosmiv")
    S3_PUBLIC_BASE_URL: str = os.getenv(
        "S3_PUBLIC_BASE_URL", "http://localhost:9000/cosmiv"
    )

    # Broker
    REDIS_URL: str = "redis://redis:6379/0"

    # CORS Configuration
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Allowed hosts for production
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    # Logging
    LOG_LEVEL: str = "INFO"  # DEBUG, INFO, WARNING, ERROR
    
    # Error Tracking (Sentry)
    SENTRY_DSN: str = os.getenv("SENTRY_DSN", "")
    SENTRY_ENABLED: bool = os.getenv("SENTRY_ENABLED", "false").lower() == "true"
    SENTRY_ENVIRONMENT: str = os.getenv("SENTRY_ENVIRONMENT", ENVIRONMENT)
    SENTRY_TRACES_SAMPLE_RATE: float = float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1"))  # 10% of transactions

    # JWT Authentication
    # ⚠️ SECURITY: This default is ONLY for development. MUST set JWT_SECRET_KEY environment variable in production!
    # Generate a secure key with: openssl rand -hex 32
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY", "INSECURE_DEV_KEY_CHANGE_IN_PRODUCTION"
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # 7 days

    # Stripe
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_PUBLISHABLE_KEY: str = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    STRIPE_PRICE_ID_PRO: str = os.getenv("STRIPE_PRICE_ID_PRO", "")
    STRIPE_PRICE_ID_CREATOR: str = os.getenv("STRIPE_PRICE_ID_CREATOR", "")
    BASE_URL: str = os.getenv("BASE_URL", "http://localhost:3001")

    # Social Media APIs (Mock mode by default, set to True with real credentials)
    TIKTOK_API_ENABLED: bool = (
        os.getenv("TIKTOK_API_ENABLED", "false").lower() == "true"
    )
    YOUTUBE_API_ENABLED: bool = (
        os.getenv("YOUTUBE_API_ENABLED", "false").lower() == "true"
    )
    INSTAGRAM_API_ENABLED: bool = (
        os.getenv("INSTAGRAM_API_ENABLED", "false").lower() == "true"
    )

    # Gaming Platform APIs (Mock mode by default)
    STEAM_API_ENABLED: bool = os.getenv("STEAM_API_ENABLED", "false").lower() == "true"
    STEAM_API_KEY: str = os.getenv("STEAM_API_KEY", "")
    XBOX_API_ENABLED: bool = os.getenv("XBOX_API_ENABLED", "false").lower() == "true"
    XBOX_CLIENT_ID: str = os.getenv("XBOX_CLIENT_ID", "")
    XBOX_CLIENT_SECRET: str = os.getenv("XBOX_CLIENT_SECRET", "")
    PLAYSTATION_API_ENABLED: bool = (
        os.getenv("PLAYSTATION_API_ENABLED", "false").lower() == "true"
    )
    PLAYSTATION_CLIENT_ID: str = os.getenv("PLAYSTATION_CLIENT_ID", "")
    PLAYSTATION_CLIENT_SECRET: str = os.getenv("PLAYSTATION_CLIENT_SECRET", "")
    NINTENDO_API_ENABLED: bool = (
        os.getenv("NINTENDO_API_ENABLED", "false").lower() == "true"
    )
    NINTENDO_CLIENT_ID: str = os.getenv("NINTENDO_CLIENT_ID", "")
    NINTENDO_CLIENT_SECRET: str = os.getenv("NINTENDO_CLIENT_SECRET", "")

    # AI Music Generation
    MUSICGEN_ENABLED: bool = os.getenv("MUSICGEN_ENABLED", "false").lower() == "true"
    SUNO_API_ENABLED: bool = os.getenv("SUNO_API_ENABLED", "false").lower() == "true"
    SUNO_API_KEY: str = os.getenv("SUNO_API_KEY", "")
    SUNO_API_URL: str = os.getenv("SUNO_API_URL", "https://api.suno.ai/v1")
    MUBERT_API_ENABLED: bool = (
        os.getenv("MUBERT_API_ENABLED", "false").lower() == "true"
    )
    MUBERT_API_KEY: str = os.getenv("MUBERT_API_KEY", "")
    MUBERT_API_URL: str = os.getenv("MUBERT_API_URL", "https://api.mubert.com/v2")

    # AI Services (LLM)
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "openai")  # openai, anthropic, local
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    AI_DEFAULT_MODEL: str = os.getenv("AI_DEFAULT_MODEL", "gpt-4-turbo-preview")
    AI_ENABLED: bool = os.getenv("AI_ENABLED", "true").lower() == "true"


settings = Settings()  # reads from env

# Security validation for production
if settings.ENVIRONMENT == "production":
    warnings = []
    errors = []

    # Critical errors - will prevent startup
    if settings.JWT_SECRET_KEY == "INSECURE_DEV_KEY_CHANGE_IN_PRODUCTION" or len(settings.JWT_SECRET_KEY) < 32:
        errors.append(
            "JWT_SECRET_KEY must be set to a secure random string (min 32 chars). "
            "Generate with: openssl rand -hex 32"
        )

    if settings.S3_SECRET_KEY == "minioadmin":
        errors.append("S3_SECRET_KEY is using default value - must be changed for production")

    if "CHANGEME" in settings.POSTGRES_DSN or "postgres:postgres" in settings.POSTGRES_DSN:
        errors.append("POSTGRES_DSN contains default credentials - must be changed for production")

    if "localhost" in settings.ALLOWED_ORIGINS or "127.0.0.1" in settings.ALLOWED_ORIGINS:
        errors.append("ALLOWED_ORIGINS contains localhost - not allowed in production")

    # Warnings - will log but not prevent startup
    if not settings.ENCRYPTION_KEY:
        warnings.append("ENCRYPTION_KEY not set - OAuth token encryption may be insecure")

    if settings.JWT_SECRET_KEY and len(settings.JWT_SECRET_KEY) < 32:
        warnings.append("JWT_SECRET_KEY is shorter than recommended 32 characters")

    # Raise errors (critical)
    if errors:
        error_msg = "🚨 PRODUCTION SECURITY ERRORS - Application will not start:\n" + "\n".join(
            f"  ❌ {e}" for e in errors
        )
        logger.error(error_msg)
        raise ValueError(error_msg)

    # Log warnings (non-critical but important)
    if warnings:
        warning_msg = "⚠️ PRODUCTION SECURITY WARNINGS:\n" + "\n".join(
            f"  ⚠️ {w}" for w in warnings
        )
        logger.warning(warning_msg)

# Development warnings
if settings.ENVIRONMENT == "development":
    if settings.JWT_SECRET_KEY == "INSECURE_DEV_KEY_CHANGE_IN_PRODUCTION":
        logger.warning(
            "Using default JWT_SECRET_KEY - OK for development, CHANGE for production!"
        )
    if settings.S3_SECRET_KEY == "minioadmin":
        logger.warning(
            "Using default S3 credentials - OK for development, CHANGE for production!"
        )
