# 🚀 Quick Start - Testing Video Editing

## ✅ Current Status

**Backend:** Running on `http://localhost:8000`  
**Frontend:** Should be starting on `http://localhost:3000`  
**Docker:** ✅ Backend container is up

---

## 📹 How to Test Video Editing

### Option 1: Through the Web UI (Recommended)

1. **Open your browser** to: `http://localhost:3000`

2. **Navigate to Upload/Dashboard:**

   - You'll see the landing page
   - Click "Get Started" or go to the Dashboard/Upload tab

3. **Upload Video Files:**

   - You can upload:
     - **ZIP file** containing multiple video clips (.mp4, .mov, .mkv)
     - **Individual video files** (select multiple)
   - Supported formats: `.mp4`, `.mov`, `.mkv`, `.webm`, `.avi`, `.m4v`

4. **Configure Your Edit:**

   - **Target Duration:** 30-60 seconds (default: 60)
   - **Style/Theme:**
     - Cinematic (slow, dramatic)
     - Esports Fast-Cut (fast-paced, energetic)
     - Chill Montage (relaxed, smooth)
   - **Format:** Landscape (YouTube) or Portrait (TikTok/Shorts)

5. **Submit and Wait:**

   - Click "Generate Highlight"
   - Watch the progress bar
   - The job will process in the background (Celery worker)
   - You'll see status updates (PENDING → PROCESSING → COMPLETED)

6. **Download Result:**
   - Once complete, you'll see download links
   - Click to download your edited video!

### Option 2: Direct API Test (Advanced)

If you want to test the API directly:

```bash
# Create a test job
curl -X POST "http://localhost:8000/v2/jobs" \
  -F "files=@video1.mp4" \
  -F "files=@video2.mp4" \
  -F "target_duration=60" \
  -F "style=cinematic" \
  -F "formats=landscape,portrait"

# Check job status
curl "http://localhost:8000/v2/jobs/{job_id}/status"

# Download result (when completed)
curl "http://localhost:8000/v2/jobs/{job_id}/download?format=landscape" --output highlight.mp4
```

---

## 🎬 What to Expect

### The Video Processing Pipeline:

1. **Upload** → Files saved to storage
2. **Preprocessing** → Videos transcoded to consistent format (H.264, 1080p, 30fps)
3. **Analysis** → Scene detection, audio peaks, motion scoring
4. **Selection** → Best scenes selected up to target duration
5. **Editing** → Scenes assembled with transitions, music, color grading
6. **Rendering** → Final MP4 exported

### Processing Time:

- Small clips (< 5 min each): ~2-5 minutes
- Medium clips (5-15 min): ~5-15 minutes
- Large clips (15+ min): ~15-30 minutes

_Processing time depends on video length, number of clips, and system resources._

---

## 🎥 Sample Videos for Testing

You can use **any video files** you have! Here are some ideas:

1. **Gameplay Clips:**

   - Counter-Strike highlights
   - Valorant plays
   - Any FPS game clips
   - Racing game moments

2. **IRL Content:**

   - Action clips
   - Travel footage
   - Any exciting moments

3. **Short Test Videos:**
   - If you don't have clips, record a quick 10-30 second video on your phone
   - Export as MP4
   - Upload multiple short clips to test the multi-clip feature

---

## ⚙️ Troubleshooting

### Backend Not Running?

```bash
cd backend
docker-compose up -d
```

### Frontend Not Starting?

```bash
npm install  # If first time
npm run dev
```

### Worker Not Processing Jobs?

Check if the Celery worker is running:

```bash
cd backend
docker-compose ps
```

You should see:

- `backend-backend-1` (FastAPI server)
- `backend-worker-1` (Celery worker)
- `backend-beat-1` (Celery beat scheduler)
- `backend-redis-1` (Redis)

If worker is missing:

```bash
cd backend
docker-compose up worker -d
```

### Job Stuck in PENDING?

- Check worker logs: `docker-compose logs worker`
- Check Redis is running: `docker-compose ps redis`
- Restart worker: `docker-compose restart worker`

### API Connection Issues?

- Verify backend is on `http://localhost:8000`
- Check CORS settings in `backend/src/main.py`
- Frontend should proxy to `/api` → `http://localhost:8000`

---

## 📊 Monitor Progress

1. **In the UI:** Watch the progress bar and status messages
2. **Via API:** Check `/v2/jobs/{job_id}/status` for detailed progress
3. **Via Docker Logs:**
   ```bash
   cd backend
   docker-compose logs -f worker
   ```

---

## 🎯 Quick Test Checklist

- [ ] Backend running (`http://localhost:8000`)
- [ ] Frontend running (`http://localhost:3000`)
- [ ] Worker container running
- [ ] Upload a video file or ZIP
- [ ] Select style and duration
- [ ] Submit job
- [ ] Watch progress
- [ ] Download completed video

---

## 💡 Pro Tips

1. **Start Small:** Test with 1-2 short clips (30-60 seconds each) first
2. **Check Worker Logs:** If something fails, check `docker-compose logs worker`
3. **Try Different Styles:** Each style produces different results
4. **Multi-Format:** Try both landscape and portrait formats
5. **Check Storage:** Videos are saved in `backend/storage/exports/`

---

**Ready to test?** Go to `http://localhost:3000` and start uploading! 🚀
