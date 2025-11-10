import io
import json
import shutil

import pytest
from fastapi.testclient import TestClient
from sqlmodel import select

# Import main inside fixtures to ensure database is patched first
from db import get_session
from models import UploadedClip
from services.storage_adapters import LocalStorage


@pytest.fixture
def client(in_memory_db):
    """Create test FastAPI client with database setup"""
    # Import here to ensure database is patched first
    from main import app
    # in_memory_db fixture ensures database is set up first
    with TestClient(app) as c:
        yield c


def test_manual_clip_upload_success(tmp_path, monkeypatch, client):
    def fake_save(self, src_path: str, dest_rel_path: str) -> str:
        dest_abs = tmp_path / dest_rel_path
        dest_abs.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src_path, dest_abs)
        return str(dest_abs)

    monkeypatch.setattr(LocalStorage, "save", fake_save, raising=False)

    video_bytes = b"fake video data"
    resp = client.post(
        "/api/upload",
        files={"file": ("clip.mp4", io.BytesIO(video_bytes), "video/mp4")},
        data={"metadata": json.dumps({"title": "Test Clip"})},
    )

    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "uploaded"
    assert "clip_id" in data

    clip_id = data["clip_id"]

    with get_session() as session:
        stored = session.exec(select(UploadedClip).where(UploadedClip.clip_id == clip_id)).first()
        assert stored is not None
        assert stored.original_name == "clip.mp4"
        assert stored.size_bytes == len(video_bytes)
        assert stored.metadata_json == {"title": "Test Clip"}
        assert stored.storage_path.endswith("clip.mp4")


def test_manual_clip_upload_rejects_invalid_metadata(client):
    resp = client.post(
        "/api/upload",
        files={"file": ("clip.mp4", io.BytesIO(b"video"), "video/mp4")},
        data={"metadata": "not-json"},
    )

    assert resp.status_code == 400
    assert resp.json()["detail"] == "metadata must be valid JSON"


def test_manual_clip_upload_rejects_invalid_extension(client):
    resp = client.post(
        "/api/upload",
        files={"file": ("clip.txt", io.BytesIO(b"plain text"), "text/plain")},
    )

    assert resp.status_code == 400
    assert "Invalid file extension" in resp.json()["detail"]
