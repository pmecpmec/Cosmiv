# TODO_DAAN

📋 **1. Overview**

Welcome, Daan (aka `DeWindWaker`)! You’re our integrations and inspiration scout. Your focus areas:

- Connect the platform to external APIs and services (game networks, billing, AI tooling, storage)
- Source modern UI/UX inspiration that fits an AI-powered gaming montage experience
- Lean on ChatGPT whenever something is unclear—ask for walkthroughs, API docs, or examples on demand

⚙️ **2. Current Progress Snapshot**

- ✅ FastAPI backend with Celery workers, Redis broker, and v2 REST endpoints (`jobs`, `accounts`, `billing`, `social`, `styles`)
- ✅ React + Vite + Tailwind UI covering Upload, Dashboard, Accounts, Billing, and Social tabs
- ✅ Mock game-account OAuth flows plus clip discovery scheduler (Celery beat every 30m)
- ✅ Mock Stripe-like billing endpoints with entitlement model and freemium guardrails
- ✅ Storage adapters for local FS and S3/MinIO with feature-flagged configuration in `backend/src/config.py`
- ✅ Docker Compose stack (backend, worker, beat, redis, optional postgres/minio) ready for local spin-up

🚀 **3. Tasks to Do** *(mark with ✅ when finished, leave ❌ until complete)*

- **API & Integrations**
  - ❌ Inventory credential requirements and OAuth flows for Steam, Xbox Live, PlayStation Network, and Nintendo Switch; note trust center URLs and required scopes
  - ❌ Confirm billing provider path (Stripe vs. alternative) and capture webhook/event workflow; draft `.env.example` entries for secret keys
  - ❌ Review AI service touchpoints (Whisper STT, MusicGen/Riffusion, highlight ML) and outline which external APIs we’ll call vs. host in-house; document where credentials/config will live
  - ❌ Smoke-test existing mock endpoints through the frontend to ensure request/response shapes are ready for live swapping

- **Automation & Operations**
  - ❌ Map clip import/export automation: define cron cadence for Celery beat, export destinations (S3 vs. local), and weekly montage auto-upload targets
  - ❌ Validate S3/MinIO adapter paths by running a credentials dry-run plan (no keys yet); note bucket naming conventions and IAM needs
  - ❌ Propose notification surface (email, Discord, webhooks) for when weekly montage jobs finish, including which service would send it

- **Design & UX Research**
  - ❌ Collect at least three modern gaming/AI dashboard inspirations (Dribbble, Behance, Pinterest, etc.); drop assets or links into a new `/designs/` folder with short captions
  - ❌ Draft motion/animation ideas (loading screen, tab transitions, success states) and log them in `/designs/notes.md`
  - ❌ Summarize typography, color, and iconography direction that matches the references so UI can be themed consistently

- **Documentation & Comms**
  - ❌ After finishing each task above, update its marker here to ✅ and add a one-line summary with date
  - ❌ Notify Pedro (`pmec`) inside Discord/PM when an integration is verified or new design set is ready; include any blockers ChatGPT surfaced

🧭 **4. If You Don’t Know What to Do Next**

1. Ask ChatGPT for a how-to or integration checklist—mention the task name from this file for context.
2. Document what you learned right here (bullet + ✅/❌) so the team sees the source and outcome.
3. Ping Pedro once you’ve captured the note or when you’re blocked for more than a day.

Let’s keep momentum—every ✅ here helps us launch the AI Gaming Platform faster!
