# Aiditor Backend

FastAPI backend for AI-powered video highlight editing.

## Prerequisites

- Docker and Docker Compose installed
- Windows: Docker Desktop

## Quick Start

### Using Docker Compose (Recommended)

```powershell
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop the container
docker-compose down
```

The API will be available at `http://localhost:8000`

### API Documentation

Once running, visit:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Testing the Upload Endpoint

```powershell
curl -X POST "http://localhost:8000/upload" `
  -F "file=@path/to/your/clips.zip" `
  -F "target_duration=60" `
  --output highlight.mp4
```

## Local Development (without Docker)

If you prefer to run without Docker:

```powershell
# Navigate to src directory
cd src

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Note:** For local development, you'll need FFmpeg installed on your system.

## Project Structure

```
backend/
├── src/
│   ├── main.py                 # FastAPI app and endpoints
│   ├── media_processing.py     # Video processing pipeline
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile              # Container definition
├── docker-compose.yml          # Docker Compose configuration
└── README.md                   # This file
```

## Features

- 🎬 Upload ZIP files containing raw video clips
- 🔍 Automatic scene detection using PySceneDetect
- ✂️ Intelligent highlight selection up to target duration
- 🎵 Video concatenation and rendering with FFmpeg
- 🐳 Containerized with Docker for easy deployment

## Development

The Docker setup includes hot-reload for development. Code changes will automatically restart the server.

## Troubleshooting

### Container won't start

```powershell
# Check logs
docker logs backend-backend-1

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Port already in use

Edit `docker-compose.yml` to change the port mapping:

```yaml
ports:
  - "8001:8000" # Use 8001 instead of 8000
```

## Services (Docker Compose)

- backend: FastAPI API (port 8000)
- worker: Celery worker for rendering
- redis: message broker for Celery

## Storage

- Mounted to `backend/storage/` → `/app/storage` inside containers
- SQLite DB: `/app/storage/db.sqlite3`
- Uploads: `/app/storage/uploads/{job_id}/`
- Exports: `/app/storage/exports/{job_id}/final_highlight.mp4`

## Env

- `REDIS_URL` (default `redis://redis:6379/0`)
- `DB_PATH` (default `/app/storage/db.sqlite3`)

## API

- `POST /jobs` (multipart)
  - form: `files` (one or more videos), `target_duration` seconds
  - returns: `{ job_id, status }`
- `GET /jobs/{job_id}/status`
  - returns: `{ job_id, status, error }`
- `GET /jobs/{job_id}/download?format=landscape|portrait`
  - returns: MP4
- `GET /analytics/summary`
  - returns counts of total, success, failed jobs

Legacy endpoints (still available):

- `POST /upload` (ZIP)
- `POST /upload-clips` (multiple videos)

## Pipeline (Small Road MVP)

1. Preprocess: normalize to H.264 1080p30 + AAC
2. Detect scenes per clip (PySceneDetect) + motion score (OpenCV)
3. Select top scenes until target duration (1–4s per clip)
4. Assemble using ffconcat; encode video
5. Generate simple music bed (sine pad) and mix/duck with original
6. Export MP4 to `exports/{job_id}/final_highlight.mp4`

## Run (full stack)

```powershell
cd backend
docker-compose up -d --build
```

Check logs:

```powershell
docker-compose logs -f backend
# or worker
docker-compose logs -f worker
```

## Dev Notes

- DB initialized at app startup
- Celery task name: `render_job(job_id, target_duration)`
- Extendable modules in `pipeline/`

## v2 API (Big Road)

- `POST /v2/jobs` — accepts options: `style`, `formats`, `hud_remove`, `watermark`, `target_duration`. Returns `{ job_id }` and enqueues render.
- `GET /v2/jobs/{job_id}/status` — returns job status.
- `GET /v2/jobs/{job_id}/download` — returns a URL/path (presigned URL when object storage enabled).

## Infra options

- SQLite (default) or Postgres: set `USE_POSTGRES=true` and provide `POSTGRES_DSN`.
- Local FS (default) or MinIO/S3: set `USE_OBJECT_STORAGE=true` and S3 envs. Create bucket `aiditor` in MinIO console (http://localhost:9001).

## Compose (optional services)

- `postgres` (port 5432)
- `minio` (ports 9000/9001)

## Env example (.env for backend)

```
USE_POSTGRES=false
USE_OBJECT_STORAGE=false
POSTGRES_DSN=postgresql+psycopg://postgres:postgres@postgres:5432/aiditor
REDIS_URL=redis://redis:6379/0
DB_PATH=/app/storage/db.sqlite3
S3_ENDPOINT_URL=http://minio:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=aiditor
S3_PUBLIC_BASE_URL=http://localhost:9000/aiditor
```

## Accounts & Clip Discovery (v2)

Endpoints (mocked providers for local dev):

- `GET /v2/accounts/providers` — list available providers
- `POST /v2/accounts/link` — form: `user_id`, `provider`, `access_token` (mock)
- `GET /v2/accounts/links?user_id=...` — list linked providers
- `POST /v2/accounts/sync` — form: `user_id`; schedules a background sync

Background jobs:

- Celery beat runs `sync_all_users_clips` every 30 minutes
- Celery task `sync_user_clips(user_id)` fetches recent clips per provider and stores in `DiscoveredClip`

Models:

- `User`, `UserAuth`, `DiscoveredClip`

Note: For production, replace mocks with real provider SDK/API integrations and secure OAuth flows.

## Highlight Detection 2.0 (model-ready)

- `ml/highlights/model.py` defines a model interface; mock implementation emits events with confidence
- Enable model influence by setting `USE_HIGHLIGHT_MODEL=true` (defaults to false)

## Styles API

- `GET /v2/styles` — list presets
- `POST /v2/styles/reference` — upload a reference video; returns extracted style features (stub)

## Flags

```
USE_HIGHLIGHT_MODEL=false
```

## STT & Censorship (stub)

- `services/stt/whisper_stub.py` returns transcript and profanity spans
- Audio chain mutes profanity spans during mix

## Social Posting (mock)

- `POST /v2/social/post` with `job_id`, `platform` schedules a mock post and returns a schedule_id
- Replace with real TikTok/YouTube/Instagram integrations in production

## Freemium

- Limit target duration via `FREEMIUM_MAX_DURATION` (default 60)
- Apply watermark via `WATERMARK_TEXT` during final muxing
