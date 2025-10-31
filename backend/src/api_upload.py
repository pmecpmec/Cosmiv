import json
import logging
import os
import tempfile
from typing import Optional, Dict, Any
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status

from config import settings
from db import get_session
from models import UploadedClip
from security import sanitize_filename, validate_video_file, MAX_FILE_SIZE
from services.storage_adapters import get_storage


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

_CHUNK_SIZE = 1024 * 1024  # 1MB per chunk


def _parse_metadata(raw_metadata: Optional[str]) -> Optional[Dict[str, Any]]:
    if not raw_metadata:
        return None
    try:
        parsed = json.loads(raw_metadata)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="metadata must be valid JSON") from exc

    if parsed is None:
        return None
    if not isinstance(parsed, dict):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="metadata must be a JSON object")
    return parsed


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_manual_clip(
    file: UploadFile = File(...),
    metadata: Optional[str] = Form(None),
):
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="file must include a filename")

    validate_video_file(file.filename, file.content_type)

    try:
        safe_name = sanitize_filename(file.filename)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    original_name = file.filename
    content_type = file.content_type
    metadata_dict = _parse_metadata(metadata)

    clip_id = uuid4().hex
    dest_rel_path = f"clips/{clip_id}/{safe_name}"
    storage = get_storage()

    storage_provider = "object" if settings.USE_OBJECT_STORAGE else "local"
    storage_path: Optional[str] = None
    public_url: Optional[str] = None
    bytes_written = 0

    await file.seek(0)

    try:
        with tempfile.TemporaryDirectory(prefix="manual-upload-") as tmpdir:
            temp_path = os.path.join(tmpdir, safe_name)
            with open(temp_path, "wb") as buffer:
                while True:
                    chunk = await file.read(_CHUNK_SIZE)
                    if not chunk:
                        break
                    bytes_written += len(chunk)
                    if bytes_written > MAX_FILE_SIZE:
                        max_mb = MAX_FILE_SIZE // (1024 * 1024)
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail=f"file exceeds maximum allowed size of {max_mb}MB",
                        )
                    buffer.write(chunk)

            if bytes_written == 0:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="uploaded file is empty")

            if settings.USE_OBJECT_STORAGE:
                try:
                    storage.upload(temp_path, dest_rel_path)  # type: ignore[attr-defined]
                    storage_path = dest_rel_path
                    if hasattr(storage, "presigned_url"):
                        try:
                            public_url = storage.presigned_url(dest_rel_path, expires=3600)  # type: ignore[attr-defined]
                        except Exception:
                            public_url = None
                except HTTPException:
                    raise
                except Exception as exc:
                    logger.exception("failed to upload manual clip to object storage", exc_info=exc)
                    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="failed to persist uploaded clip") from exc
            else:
                try:
                    storage_path = storage.save(temp_path, dest_rel_path)  # type: ignore[attr-defined]
                    if hasattr(storage, "public_url"):
                        try:
                            public_url = storage.public_url(dest_rel_path)  # type: ignore[attr-defined]
                        except Exception:
                            public_url = None
                except HTTPException:
                    raise
                except Exception as exc:
                    logger.exception("failed to save manual clip to local storage", exc_info=exc)
                    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="failed to persist uploaded clip") from exc
    finally:
        await file.close()

    if not storage_path:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="unable to determine storage path")

    with get_session() as session:
        record = UploadedClip(
            clip_id=clip_id,
            storage_path=storage_path,
            storage_provider=storage_provider,
            original_name=original_name,
            content_type=content_type,
            size_bytes=bytes_written,
            metadata_json=metadata_dict,
            status="uploaded",
            public_url=public_url,
        )
        session.add(record)
        session.commit()

    response = {"clip_id": clip_id, "status": "uploaded"}
    if public_url:
        response["url"] = public_url
    return response
