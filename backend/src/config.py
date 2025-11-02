import os
from pydantic_settings import BaseSettings
from typing import List
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"  # development, staging, production
    
    # Security - JWT Authentication
    # CRITICAL: Must be set in production via environment variable
    JWT_SECRET_KEY: str = "INSECURE_DEV_KEY_CHANGE_IN_PRODUCTION"
    
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
    POSTGRES_DSN: str = "postgresql+psycopg://postgres:CHANGEME@postgres:5432/cosmiv"
    DB_PATH: str = "/app/storage/db.sqlite3"

    # Storage (S3/MinIO)
    # CRITICAL: Change these defaults in production
    S3_ENDPOINT_URL: str = "http://minio:9000"
    S3_REGION: str = "us-east-1"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "cosmiv"
    S3_PUBLIC_BASE_URL: str = "http://localhost:9000/cosmiv"

    # Broker
    REDIS_URL: str = "redis://redis:6379/0"
    
    # CORS Configuration
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Allowed hosts for production
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()  # reads from env

# Security validation for production
if settings.ENVIRONMENT == "production":
    warnings = []
    
    if settings.JWT_SECRET_KEY == "INSECURE_DEV_KEY_CHANGE_IN_PRODUCTION":
        warnings.append("JWT_SECRET_KEY is using default value")
    
    if settings.S3_SECRET_KEY == "minioadmin":
        warnings.append("S3_SECRET_KEY is using default value")
    
    if "postgres:postgres" in settings.POSTGRES_DSN:
        warnings.append("POSTGRES_DSN contains default credentials")
    
    if "localhost" in settings.ALLOWED_ORIGINS:
        warnings.append("ALLOWED_ORIGINS contains localhost in production")
    
    if warnings:
        error_msg = "PRODUCTION SECURITY ERRORS:\n" + "\n".join(f"  - {w}" for w in warnings)
        logger.error(error_msg)
        raise ValueError(error_msg)

# Development warnings
if settings.ENVIRONMENT == "development":
    if settings.JWT_SECRET_KEY == "INSECURE_DEV_KEY_CHANGE_IN_PRODUCTION":
        logger.warning("Using default JWT_SECRET_KEY - OK for development, CHANGE for production!")
    if settings.S3_SECRET_KEY == "minioadmin":
        logger.warning("Using default S3 credentials - OK for development, CHANGE for production!")
