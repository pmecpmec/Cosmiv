# 🌌 Cosmiv - AI Gaming Montage Platform

An AI-powered web application that automatically edits highlight videos from raw gameplay or media clips. Cosmiv features a futuristic cosmic interface with space-themed UI elements and an intelligent AI assistant represented as a glowing cosmic orb.

## 🚀 Quick Start

### Prerequisites

- **Backend**: Docker and Docker Compose
- **Frontend**: Node.js 18+ and npm

### Backend Setup (Docker)

```powershell
cd backend
docker-compose up -d
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```powershell
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
Cosmiv/
├── backend/                 # Python FastAPI backend
│   ├── src/
│   │   ├── main.py         # API endpoints
│   │   ├── media_processing.py  # Video processing pipeline
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
├── frontend/                # React + Vite frontend
│   └── src/
│       ├── App.jsx
│       ├── index.jsx
│       └── components/
│           ├── UploadForm.jsx
│           └── ProgressBar.jsx
├── src/                     # Main frontend files
│   ├── App.jsx
│   ├── index.jsx
│   ├── index.css
│   └── components/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎯 Features

- 🎞️ **Upload ZIP of Clips**: Drag-and-drop your raw video clips
- 🧠 **AI Highlight Detection**: Automatically finds high-action moments
- ✂️ **Smart Scene Selection**: Selects best scenes up to target duration
- 🎵 **Multiple Themes**: Choose from Cinematic, Esports, or Chill styles
- 🚀 **Full Rendering Pipeline**: Returns final MP4 ready to download
- 📈 **Live Job Progress**: Track render stages and automatic retries in real time

## 🛠️ Technology Stack

### Backend

- FastAPI (Python)
- FFmpeg
- PySceneDetect
- OpenCV
- MoviePy
- Docker

### Frontend

- React 18
- Vite
- Tailwind CSS
- Modern, responsive UI

## 📝 Usage

1. Start the backend: `cd backend && docker-compose up -d`
2. Start the frontend: `npm run dev`
3. Open `http://localhost:3000` in your browser
4. Upload a ZIP file containing your video clips
5. Select a theme and target duration
6. Click "Generate Highlight Reel"
7. Download your finished highlight video!

## 🔧 Development

### Backend

```powershell
# View logs
docker-compose -f backend/docker-compose.yml logs -f

# Rebuild container
docker-compose -f backend/docker-compose.yml build --no-cache

# Stop container
docker-compose -f backend/docker-compose.yml down

# Run backend unit tests
pytest
```

### Frontend

```powershell
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📡 API Endpoints

- `POST /upload` - Upload a ZIP file and generate highlights
  - Parameters: `file` (ZIP), `target_duration` (seconds)
  - Returns: MP4 video file

## 🐛 Troubleshooting

### Backend Issues

**Container won't start:**

```powershell
docker logs backend-backend-1
docker-compose -f backend/docker-compose.yml restart
```

**Port already in use:**
Edit `backend/docker-compose.yml` to change the port mapping.

### Frontend Issues

**Port 3000 in use:**
Edit `vite.config.js` to use a different port.

**Can't connect to backend:**
Make sure the backend is running: `docker-compose -f backend/docker-compose.yml ps`

## 🎨 Themes

- **Cinematic**: Slow, dramatic cuts with movie-like quality
- **Esports Fast-Cut**: Fast-paced, energetic for gaming highlights
- **Chill Montage**: Relaxed, smooth transitions

## 📚 Next Steps

- [ ] Implement real theme-specific processing
- [ ] Add background music integration
- [ ] Multi-clip processing
- [ ] User authentication
- [ ] Cloud storage integration
- [ ] AI-powered enhancements (Runway/Sora)

## ✅ Phase 1 Enhancements

- Modular highlight detector combining motion, loudness, and optional ML events.
- Hardened FFmpeg rendering with NVENC capability checks and structured fallbacks.
- Celery jobs expose `stage`, `progress`, and timing metadata with retry support.
- Frontend dashboard surfaces progress, and async upload polling reflects real status.
- Added pytest coverage for detector scoring and job state persistence.

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or pull request.

## v2 Async Flow (Jobs)

- Create a job (async render): frontend uses POST `/v2/jobs` with files and target duration
- Poll status: GET `/v2/jobs/{job_id}/status`
- Download URL: GET `/v2/jobs/{job_id}/download?format=landscape|portrait`

## Multi-aspect Exports

- The renderer outputs both `final_landscape.mp4` and `final_portrait.mp4`
- If object storage is enabled, the API returns a presigned URL; otherwise a local path/URL is returned

## GPU Acceleration (optional)

- The pipeline attempts NVENC (`h264_nvenc`) and falls back to `libx264`
- Ensure host supports NVIDIA drivers for NVENC to take effect

## Billing (mock)

- GET `/v2/billing/plans`
- POST `/v2/billing/checkout` — returns mocked checkout URL
- POST `/v2/billing/entitlements` — test-only to set plan (free/pro)
- GET `/v2/billing/entitlements?user_id=...`

## Dashboard

- Frontend Dashboard shows analytics summary and recent jobs
- Uses `/analytics/summary` and `/v2/jobs` to display system status
