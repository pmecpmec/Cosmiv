import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Feature flags
    USE_POSTGRES: bool = False
    USE_OBJECT_STORAGE: bool = False
    USE_HIGHLIGHT_MODEL: bool = False
    HIGHLIGHT_DETECTOR: str = "heuristic"

    # Freemium
    FREEMIUM_MAX_DURATION: int = 60
    WATERMARK_TEXT: str = "Aiditor Free"

    # Rendering
    ENABLE_NVENC: bool = True

    # DB
    POSTGRES_DSN: str = "postgresql+psycopg://postgres:postgres@postgres:5432/aiditor"
    DB_PATH: str = "/app/storage/db.sqlite3"

    # Storage (S3/MinIO)
    S3_ENDPOINT_URL: str = "http://minio:9000"
    S3_REGION: str = "us-east-1"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "aiditor"
    S3_PUBLIC_BASE_URL: str = "http://localhost:9000/aiditor"

    # Broker
    REDIS_URL: str = "redis://redis:6379/0"

settings = Settings()  # reads from env
