# TODO_DAAN

📋 **1. Overview**

Welcome, Daan (aka `DeWindWaker`)! You’re our integrations and inspiration scout. Your focus areas (no coding required—just research, planning, and documentation):

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

- **API & Integrations Strategy**
  - ❌ Inventory credential requirements and OAuth flows for Steam, Xbox Live, PlayStation Network, and Nintendo Switch; list developer portal links, scopes, review timelines, and estimated fees
  - ❌ Draft an integration readiness brief (one-pager) describing how each provider’s sandbox/live environments work and what user information we must request during onboarding
  - ❌ Confirm billing provider direction (Stripe vs. Paddle vs. Xsolla) with pros/cons for gaming subscriptions; include webhook events we’ll need and suggest `.env` variables for secrets storage

- **Hosting, Automation & Operations**
  - ❌ Evaluate three hosting options (e.g., Fly.io, Render, Railway, AWS) for the FastAPI + Celery stack; capture pricing, GPU availability, and deployment complexity in a comparison table
  - ❌ Map the clip import/export automation flow: note desired Celery beat cadence, storage destination (S3 vs. local), and where weekly montage uploads should land (YouTube, S3 folder, etc.)
  - ❌ Recommend a notification/alerting approach when weekly montage jobs finish (Slack, Discord, email); outline tool choices and setup steps (no code required)

- **Design & UX Research**
  - ❌ Collect at least three modern gaming/AI dashboard inspirations (Dribbble, Behance, Pinterest, etc.) and save links or screenshots into `/designs/` with short captions
  - ❌ Draft motion/animation concepts (loading screen, tab transitions, success celebrations) and log them in `/designs/notes.md`
  - ❌ Summarize typography, color palette, and iconography direction that aligns with the references so the UI can be themed consistently

- **Documentation & Comms**
  - ❌ After finishing each task above, update its marker here to ✅ and add a one-line summary with date
  - ❌ Notify Pedro (`pmec`) inside Discord/PM when an integration plan, hosting recommendation, or design set is ready; include any blockers ChatGPT surfaced

🧭 **4. If You Don’t Know What to Do Next**

1. Ask ChatGPT for a how-to or integration checklist—mention the task name from this file for context.
2. Document what you learned right here (bullet + ✅/❌) so the team sees the source and outcome.
3. Ping Pedro once you’ve captured the note or when you’re blocked for more than a day.

Let’s keep momentum—every ✅ here helps us launch the AI Gaming Platform faster!
