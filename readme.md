# Auto-Editor MVP — Step 1

## Prereqs (local dev)

- Python 3.10+ (recommended)
- ffmpeg installed and on PATH (`ffmpeg` CLI)
  - Ubuntu/Debian: `sudo apt install ffmpeg`
  - macOS (Homebrew): `brew install ffmpeg`

## Install

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

## Run (development)

cd src
uvicorn main:app --reload --host 127.0.0.1 --port 8000

## Test (curl)

curl -X POST "http://127.0.0.1:8000/upload" \
 -F "file=@/path/to/your/clips.zip" \
 -F "target_duration=60" \
 --output highlight.mp4

## Notes

- This MVP is synchronous and intended for local testing. For production:
  - Move heavy processing to isolated worker containers (Celery/RQ/etc.)
  - Use S3 for storage, and async job status endpoints.
  - Improve scoring model and add theme presets, music ducking, transitions, overlays.
