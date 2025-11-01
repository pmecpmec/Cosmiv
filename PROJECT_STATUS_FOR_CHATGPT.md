# PROJECT_STATUS_FOR_CHATGPT

## ✅ Completed
- FastAPI backend with Celery workers, Redis broker, and comprehensive v2 REST endpoints covering jobs, accounts, billing, social, and style presets
- Clip processing pipeline (preprocess → detect → score → edit → render → music → censor) with highlight detector stub and multi-aspect exports
- Storage adapters for local filesystem and S3/MinIO, plus feature flag configuration in `backend/src/config.py`
- React + Vite + Tailwind frontend delivering Upload, Dashboard, Accounts, Billing, and Social tabs with synchronous and async upload flows
- Docker Compose stack orchestrating backend API, Celery worker/beat, Redis, and optional Postgres/MinIO services
- Automated tests for highlight detection heuristics and Celery task behavior in `backend/tests`

## ⚙️ In Progress
- Platform credential research for Steam, Xbox Live, PlayStation Network, and Nintendo Switch – Daan compiling developer portal requirements and scopes
- Billing provider evaluation (Stripe vs. Paddle vs. Xsolla) with webhook/event mapping – Daan preparing recommendation brief
- Hosting strategy comparison (Fly.io, Render, Railway, AWS) for FastAPI + Celery – Daan gathering pricing, GPU availability, deployment considerations
- Weekly montage automation planning (Celery beat cadence, export destinations, notification channel) – Daan outlining operations flow
- Design inspiration roundup for gaming/AI dashboards, animations, and visual language – Daan capturing references and motion ideas

## 🕒 Pending
- Production-ready OAuth implementations and secure credential storage for all game platforms
- Live billing integration with subscriptions, webhooks, and entitlement sync
- Real social media API integrations (TikTok, YouTube, Instagram) beyond current stubs
- ML upgrades: train/deploy highlight detection model, integrate MusicGen/Riffusion, and connect to Whisper (or equivalent) for STT
- Real-time progress delivery (e.g., WebSocket or push notifications) and admin analytics panel
- Production observability stack (Prometheus/Grafana, Sentry) and deployment automation (Postgres, Kubernetes manifests)

## 📦 Repository Overview
- `backend/` – FastAPI app, Celery tasks, pipeline modules, service adapters, configuration, and Docker assets
  - `src/api_*.py` routers, `models.py` (SQLModel entities), `pipeline/` processing stages, `services/` integrations, `ml/` highlight model stub
  - `docker-compose.yml` orchestrating API, worker, beat, Redis, optional Postgres & MinIO
- `src/` – React frontend with tabbed dashboard (`App.jsx`) and feature-specific components (`UploadForm.jsx`, `Dashboard.jsx`, etc.)
- `BIGROAD_COMPLETE.md` – roadmap status for the “Big Road” milestone (notes remaining production gaps)
- `TODO_DAAN.md` – integration & design action plan for Daan (update status markers as tasks close)

## Notes for ChatGPT
- Default base URL assumptions: frontend proxy hits backend via `/api/*`; backend expects env flags for storage/object stores (`USE_OBJECT_STORAGE`, etc.)
- Daan relies on ChatGPT for API credential research, webhook diagrams, and design briefs—be ready with SDK comparisons, environment-variable templates, and UX inspiration summaries
- Next focus: help Daan replace mocks with real integrations, flesh out weekly montage automation, and translate design references into actionable UI tickets
- When Pedro (pmec) asks for updates, summarize progress from `TODO_DAAN.md` and pending items above; highlight any blockers that need engineering support
