import os
from typing import List

import pytest
from fastapi.testclient import TestClient

import main


@pytest.fixture()
def client() -> TestClient:
    return TestClient(main.app)


def _make_file(filename: str, content: bytes, content_type: str):
    return (
        "files",
        (
            filename,
            content,
            content_type,
        ),
    )


def test_upload_clips_valid_response(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    captured_paths: List[str] = []

    def fake_process_clips_highlight(paths: List[str], target_duration: int, workdir: str) -> str:
        captured_paths.extend(paths)
        assert target_duration == 45
        assert all(os.path.exists(p) for p in paths)
        output = os.path.join(workdir, "final_highlight.mp4")
        with open(output, "wb") as fh:
            fh.write(b"unit-test-video")
        return output

    monkeypatch.setattr(main, "process_clips_highlight", fake_process_clips_highlight)

    files = [
        _make_file("clip1.mp4", b"video-data-1", "video/mp4"),
        _make_file("clip2.mov", b"video-data-2", "video/quicktime"),
    ]

    response = client.post("/upload-clips", files=files, data={"target_duration": "45"})

    assert response.status_code == 200
    assert response.headers["content-type"] == "video/mp4"
    assert response.headers["content-disposition"].endswith('filename="highlight.mp4"')
    assert response.content == b"unit-test-video"
    # Ensure saved files were passed to processor
    assert len(captured_paths) == 2


def test_upload_clips_invalid_extension(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    def fake_process_clips_highlight(paths: List[str], target_duration: int, workdir: str) -> str:
        raise ValueError("Invalid file extension: .txt")

    monkeypatch.setattr(main, "process_clips_highlight", fake_process_clips_highlight)

    files = [
        _make_file("notes.txt", b"not-video", "text/plain"),
    ]

    response = client.post("/upload-clips", files=files, data={"target_duration": "60"})

    assert response.status_code == 500
    assert response.json() == {"error": "Invalid file extension: .txt"}


def test_upload_clips_file_too_large(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    def fake_process_clips_highlight(paths: List[str], target_duration: int, workdir: str) -> str:
        for path in paths:
            if os.path.getsize(path) > 1024:
                raise ValueError("File too large")
        return os.path.join(workdir, "final_highlight.mp4")

    monkeypatch.setattr(main, "process_clips_highlight", fake_process_clips_highlight)

    files = [
        _make_file("big_clip.mp4", b"x" * 2048, "video/mp4"),
    ]

    response = client.post("/upload-clips", files=files, data={"target_duration": "60"})

    assert response.status_code == 500
    assert response.json() == {"error": "File too large"}
