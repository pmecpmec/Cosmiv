# Quick Start Guide

Get Cosmiv up and running in minutes.

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.12+
- **Docker** and Docker Compose (for backend)
- **FFmpeg** (for video processing)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend/src
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp env.production.example .env
# Edit .env with your settings
```

**Required variables:**
- `JWT_SECRET_KEY` - Generate with: `openssl rand -hex 32`
- `POSTGRES_DSN` - Database connection string (or use SQLite)
- `REDIS_URL` - Redis connection string

### 3. Initialize Database

```bash
# Using SQLModel (development)
python -c "from db import init_db; init_db()"

# Or using Alembic (production)
alembic upgrade head
```

### 4. Start Services

```bash
# Using Docker Compose
docker-compose up -d

# Or manually
# Terminal 1: Start FastAPI
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start Celery worker
celery -A tasks worker --loglevel=info

# Terminal 3: Start Celery beat (for scheduled tasks)
celery -A tasks beat --loglevel=info
```

### 5. Verify Installation

```bash
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected"
}
```

## Frontend Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:
```
VITE_API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## First Job

### 1. Register Account

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!"}'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!"}'
```

Save the `access_token` from the response.

### 3. Create Job

```bash
curl -X POST http://localhost:8000/api/v2/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@clip1.mp4" \
  -F "files=@clip2.mp4" \
  -F "target_duration=60" \
  -F "style=cinematic"
```

### 4. Check Status

```bash
curl http://localhost:8000/api/v2/jobs/JOB_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Download Result

```bash
curl http://localhost:8000/api/v2/jobs/JOB_ID/download?format=landscape \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o result.mp4
```

## Using the Web Interface

1. Open `http://localhost:3000`
2. Click "Sign Up" to create an account
3. Upload video clips (drag and drop)
4. Select style and duration
5. Click "Generate Highlight Reel"
6. Wait for processing (watch progress bar)
7. Download your montage!

## Troubleshooting

### Backend won't start

- Check database connection: `POSTGRES_DSN` or `DB_PATH`
- Check Redis connection: `REDIS_URL`
- Verify ports 8000, 6379 are available

### Jobs stuck in PENDING

- Check Celery worker is running: `celery -A tasks worker`
- Check Redis is accessible
- Review logs: `docker-compose logs backend`

### Video processing fails

- Verify FFmpeg is installed: `ffmpeg -version`
- Check file permissions
- Review error logs in job status

### Frontend can't connect

- Verify `VITE_API_URL` matches backend URL
- Check CORS settings in backend
- Open browser console for errors

## Next Steps

- Read [API Reference](./API_REFERENCE.md)
- Check [Deployment Guide](./DEPLOYMENT.md)
- Review [Monitoring Setup](./MONITORING.md)

## Development Tips

### Hot Reload

- Backend: `uvicorn main:app --reload`
- Frontend: `npm run dev` (Vite auto-reloads)

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Running Tests

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
npm test
```

### Debugging

- Backend logs: Check console output or `docker-compose logs`
- Frontend: Use browser DevTools
- API: Use FastAPI docs at `http://localhost:8000/docs`

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup.

---

**Need help?** Check the [troubleshooting section](#troubleshooting) or open an issue.

