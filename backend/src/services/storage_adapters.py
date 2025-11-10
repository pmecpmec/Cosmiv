import os
from datetime import timedelta
from typing import Optional
from config import settings

# Optional boto3 import (only needed if using S3 storage)
try:
    import boto3
    from botocore.client import Config as BotoConfig

    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False


class LocalStorage:
    def save(self, src_path: str, dest_rel_path: str) -> str:
        dest_abs = os.path.join("/app/storage", dest_rel_path)
        os.makedirs(os.path.dirname(dest_abs), exist_ok=True)
        with open(src_path, "rb") as fsrc, open(dest_abs, "wb") as fdst:
            fdst.write(fsrc.read())
        return dest_abs

    def public_url(self, rel_path: str) -> str:
        base = settings.S3_PUBLIC_BASE_URL  # fallback base for dev
        return f"{base}/{rel_path}"


class S3Storage:
    def __init__(self):
        if not BOTO3_AVAILABLE:
            raise ImportError(
                "boto3 is required for S3 storage. Install with: pip install boto3"
            )
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION,
            config=BotoConfig(s3={"addressing_style": "path"}),
        )
        self.bucket = settings.S3_BUCKET

    def upload(self, src_path: str, dest_key: str):
        self.client.upload_file(src_path, self.bucket, dest_key)
        return dest_key

    def presigned_url(self, dest_key: str, expires: int = 3600) -> str:
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": dest_key},
            ExpiresIn=expires,
        )


def get_storage():
    if settings.USE_OBJECT_STORAGE:
        return S3Storage()
    return LocalStorage()
