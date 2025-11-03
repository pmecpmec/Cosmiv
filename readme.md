# 🌌 Cosmiv - AI Gaming Montage Platform

An AI-powered web application that automatically edits highlight videos from raw gameplay or media clips. Cosmiv features a futuristic cosmic interface with space-themed UI elements and an intelligent AI assistant represented as a glowing cosmic orb. Transform your raw gameplay clips into viral, AI-edited montages automatically.

## 🌐 Try It Now!

**Visit the live website:** [https://pmecpmec.github.io/Cosmiv/](https://pmecpmec.github.io/Cosmiv/) *(Note: Update URL when repo is renamed)*

Upload your clips, choose your style, and let AI create your next viral highlight reel! 🚀

## ✨ Features

- 🤖 **AI-Powered Editing** - Automatic highlight detection and montage creation
- 🎨 **Multiple Styles** - Cinematic, gaming, energetic, and more
- 🎵 **AI Music Generation** - Style-matched soundtracks
- 📱 **Multi-Format** - Landscape (YouTube) and Portrait (TikTok/Shorts)
- 🔄 **Weekly Montages** - Community-compiled highlights
- 💳 **Subscription Tiers** - Free, Pro, and Creator+ options
- 🔗 **Platform Integration** - Connect Steam, Xbox, PlayStation, Switch

## 🛠️ Built With

- **Frontend:** React, Vite, TailwindCSS, Framer Motion
- **Backend:** FastAPI, Python, Celery, Redis
- **AI:** Custom highlight detection, scene analysis, style matching
- **Deployment:** GitHub Pages (Frontend), Railway/Render (Backend)

## 📚 Documentation

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

## 🤖 AI Assistant Setup

The platform includes an AI chatbot assistant powered by OpenAI or Anthropic. To enable it:

### 1. Get an API Key

**Option A: OpenAI** (Recommended for testing)
- Get your API key from: https://platform.openai.com/api-keys
- Add it to your environment variables

**Option B: Anthropic (Claude)**
- Get your API key from: https://console.anthropic.com/
- Add it to your environment variables

### 2. Configure Your Environment

**For Docker (docker-compose.yml):**
```yaml
environment:
  - AI_PROVIDER=openai  # or "anthropic"
  - OPENAI_API_KEY=sk-your-key-here  # if using OpenAI
  # - ANTHROPIC_API_KEY=sk-ant-your-key-here  # if using Anthropic
```

**For Local Development (.env file):**
```
AI_PROVIDER=openai
AI_ENABLED=true
AI_DEFAULT_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. Install AI Packages

The AI packages are now enabled in `requirements.txt`. If running with Docker, rebuild:
```powershell
cd backend
docker-compose build --no-cache
docker-compose up -d
```

### 4. Test the AI Assistant

Once configured, the AI chatbot will:
- Answer questions about the platform
- Help with video editing features
- Provide technical support
- Guide users through subscriptions

**Without an API key**, the chatbot will show a mock response asking you to configure your keys.

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

## 📚 Documentation

- **Security Guide:** [SECURITY.md](./SECURITY.md)
- **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **GitHub Pages:** [GITHUB_PAGES_DEPLOY.md](./GITHUB_PAGES_DEPLOY.md)

## ✅ Phase 1 Enhancements

- Modular highlight detector combining motion, loudness, and optional ML events.
- Hardened FFmpeg rendering with NVENC capability checks and structured fallbacks.
- Celery jobs expose `stage`, `progress`, and timing metadata with retry support.
- Frontend dashboard surfaces progress, and async upload polling reflects real status.
- Added pytest coverage for detector scoring and job state persistence.

## 📄 License

This project is open source. See LICENSE file for details.

---

**Made with ❤️ for gamers and content creators**

**Live Site:** [https://pmecpmec.github.io/Cosmiv/](https://pmecpmec.github.io/Cosmiv/) *(Note: Update URL when repo is renamed)*
