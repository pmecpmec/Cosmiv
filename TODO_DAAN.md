# TODO_DAAN.md

_Last updated: 2025-01-27 by agent_cosmiv_sync_

## 👋 Welcome, Daan (DeWindWaker)

You're in charge of **API integrations**, **external service connections**, and **design inspiration** for **Cosmiv**, the AI Gaming Montage Platform.  
You'll mostly use **ChatGPT** to figure out things step-by-step.  
Focus on verifying APIs, researching credentials, and keeping design direction fresh.

---

## ✅ Current Snapshot

| Area                       | Status                  | Notes                                                    |
| -------------------------- | ----------------------- | -------------------------------------------------------- |
| Steam/Xbox/PS/Switch OAuth | ⚙️ Mock mode            | OAuth handlers exist but need real credentials + testing |
| Billing (Stripe)           | ⚙️ Mock mode            | Structure ready, needs webhook setup + live keys         |
| Weekly Montage Automation  | ⚙️ Infrastructure ready | Celery beat exists, needs destination config             |
| Social Media Posting       | ⚙️ Mock mode            | TikTok/YouTube/Instagram endpoints ready, need real APIs |
| Design References          | ✅ Space theme implemented | Cosmic background with animated planet, space-themed UI colors (violet → deep blue → neon cyan) |

---

## 🚀 Tasks To Do

### 🎮 Platform OAuth Setup (Priority: High)

**Goal:** Enable real OAuth for Steam, Xbox, PlayStation, and Nintendo Switch

**Steps:**

1. **Steam OpenID Setup:**

   - Get Steam API key from: https://steamcommunity.com/dev/apikey
   - Set `STEAM_API_KEY` in `.env` file (backend/.env or production env)
   - Test callback URL: should be `https://yourdomain.com/api/v2/accounts/oauth/steam/callback`
   - Verify scopes: Steam uses OpenID 2.0 (no scopes needed, but check docs)
   - File to check: `backend/src/services/platform_oauth.py` (lines 16-88)

2. **Xbox Live OAuth:**

   - Register app at: https://portal.azure.com → Azure Active Directory → App registrations
   - Get `XBOX_CLIENT_ID` and `XBOX_CLIENT_SECRET`
   - Set redirect URI to: `https://yourdomain.com/api/v2/accounts/oauth/xbox/callback`
   - Required scopes: `XboxLive.signin XboxLive.offline_access`
   - Test the flow: File location `backend/src/services/platform_oauth.py` (lines 91-165)
   - Set environment variables: `XBOX_API_ENABLED=true`, `XBOX_CLIENT_ID`, `XBOX_CLIENT_SECRET`

3. **PlayStation Network (PSN) OAuth:**

   - Register at: https://developer.playstation.com/
   - Create OAuth application, get Client ID and Secret
   - Set redirect URI: `https://yourdomain.com/api/v2/accounts/oauth/playstation/callback`
   - Required scope: `psn:clientapp` (check if more are needed for clip access)
   - Set env vars: `PLAYSTATION_API_ENABLED=true`, `PLAYSTATION_CLIENT_ID`, `PLAYSTATION_CLIENT_SECRET`
   - File location: `backend/src/services/platform_oauth.py` (lines 168-241)

4. **Nintendo Switch OAuth:**
   - Register at: https://developer.nintendo.com/
   - Create OAuth app, get Client ID and Secret
   - Redirect URI: `https://yourdomain.com/api/v2/accounts/oauth/nintendo/callback`
   - Required scopes: `openid user` (verify if additional scopes needed for gameplay data)
   - Set env vars: `NINTENDO_API_ENABLED=true`, `NINTENDO_CLIENT_ID`, `NINTENDO_CLIENT_SECRET`
   - File location: `backend/src/services/platform_oauth.py` (lines 244-317)

**Testing:**

- Once credentials are set, test each OAuth flow in the frontend: `/accounts` tab → click "Link" for each platform
- Check browser console for errors
- Verify tokens are saved in database (Pedro can help check `UserAuth` table)

**Documentation Help:**

- Ask ChatGPT: "How do I set up Xbox Live OAuth for a web application?"
- Ask ChatGPT: "What scopes do I need for PlayStation Network API to access gameplay clips?"
- Ask ChatGPT: "Nintendo Switch OAuth setup guide for developers"

---

### 💳 Billing Integration (Priority: High)

**Goal:** Replace mock Stripe with live billing + webhook handling

**Steps:**

1. **Stripe Account Setup:**

   - Create Stripe account: https://dashboard.stripe.com/register
   - Get API keys: Dashboard → Developers → API keys
   - Set environment variables:
     - `STRIPE_SECRET_KEY` (sk*live*... for production, sk*test*... for testing)
     - `STRIPE_PUBLISHABLE_KEY` (pk*live*... or pk*test*...)
     - `STRIPE_PRICE_ID_PRO` (create price ID for Pro plan in Stripe dashboard)
     - `STRIPE_PRICE_ID_CREATOR` (create price ID for Creator+ plan)

2. **Webhook Setup:**

   - In Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/v2/billing/webhook`
   - Copy webhook signing secret, set as `STRIPE_WEBHOOK_SECRET` in environment
   - Required events to listen for:
     - `checkout.session.completed` (when user subscribes)
     - `customer.subscription.deleted` (when user cancels)
     - `customer.subscription.updated` (when subscription changes)
     - `invoice.payment_succeeded` (when payment succeeds)
     - `invoice.payment_failed` (when payment fails)
   - File to check: `backend/src/api_billing_v2.py` (webhook handler exists around line 200+)

3. **Test Webhook Locally:**

   - Use Stripe CLI: `stripe listen --forward-to localhost:8000/api/v2/billing/webhook`
   - This gives you a webhook secret to test with
   - Trigger test events: `stripe trigger checkout.session.completed`

4. **Plan Configuration:**
   - In Stripe Dashboard, create Products and Prices:
     - "Pro Plan" - $9/month recurring
     - "Creator+ Plan" - $19/month recurring
   - Copy the Price IDs and add to environment variables

**Documentation Help:**

- Ask ChatGPT: "Stripe webhook setup guide for subscription billing"
- Ask ChatGPT: "How to handle Stripe subscription lifecycle events in FastAPI"

---

### 🎥 Weekly Montage Automation (Priority: Medium)

**Goal:** Automate weekly compilation of best clips into montages

**Steps:**

1. **Verify Celery Beat Configuration:**

   - Check if `tasks_enhanced.py` has weekly montage task scheduled
   - File location: `backend/src/tasks_enhanced.py`
   - Celery beat is already running in Docker Compose (see `backend/docker-compose.yml`)

2. **Research Export Destinations:**

   - **TikTok API:**
     - Research: https://developers.tiktok.com/
     - Need to register TikTok app, get access tokens
     - Check if Pedro has TikTok developer account
   - **YouTube API:**
     - Research: https://developers.google.com/youtube/v3
     - Need OAuth 2.0 credentials, enable YouTube Data API v3
     - Check file: `backend/src/services/social_posters.py` (has YouTube stub)
   - **Instagram API:**
     - Research: https://developers.facebook.com/docs/instagram-api/
     - Need Facebook Developer account, Instagram Business account

3. **Automation Flow Planning:**
   - Document: How should weekly montages be generated?
   - Which clips should be included? (highest scores? most views? specific games?)
   - What style/theme for weekly montages? (auto-selected or manual?)
   - Where should they be uploaded? (TikTok, YouTube, both?)

**Documentation Help:**

- Ask ChatGPT: "How to upload videos to TikTok using their API"
- Ask ChatGPT: "YouTube Data API v3 upload video tutorial"
- Ask ChatGPT: "Instagram Graph API upload video post"

---

### 🌌 Cosmiv Rebranding & Space Theme (Priority: Completed ✅)
**Goal:** Platform fully rebranded to Cosmiv with space-themed UI

**Status:** ✅ Completed by agent_cosmiv_sync

**What's Been Updated:**
1. **Branding:**
   - All "Aiditor" references changed to "Cosmiv" across frontend, backend, and docs
   - Package name: `cosmiv-frontend`
   - Database/bucket names: `cosmiv`
   - Celery app name: `cosmiv`

2. **Space-Themed UI:**
   - Cosmic background component with animated starfield, nebulae, and glowing planet
   - Color palette: Violet (#8B5CF6) → Deep Blue (#1E3A8A) → Neon Cyan (#00FFFF)
   - Space-themed subscription plans: "Cosmic Cadet" (free) and "Nebula Knight" (pro)
   - Updated tab styling with cosmic color accents

3. **Theme Colors (in Tailwind):**
   - `cosmic-violet`, `cosmic-deep-blue`, `cosmic-neon-cyan`
   - Cosmic gradient backgrounds
   - Space-themed hover effects and borders

**Next Design Steps (Optional Enhancements):**
1. **Additional Space Animations:**
   - Subtle particle effects on hover
   - Glowing pulse animations for AI assistant representation
   - Loading spinner with space orb

### 🎨 Design Research (Priority: Low but Important)

**Goal:** Collect modern gaming/AI dashboard design inspirations and cosmic/futuristic UI patterns

**Steps:**

1. **Create Design Folder:**
   - Create `designs/` folder at repo root
   - Create `designs/ideas.md` file

2. **Research Sources:**
   - **Dribbble:** Search for:
     - "AI gaming dashboard"
     - "montage editor UI"
     - "video editing interface"
     - "gaming highlight app"
     - "cosmic space UI design"
   - **Behance:** Search for:
     - "motion UI gaming"
     - "AI video tool interface"
     - "futuristic dashboard design"
   - **Awwwards:** Look for award-winning gaming/video apps
   - **Design Systems:** Check out:
     - Gaming company design systems (Riot Games, Epic Games)
     - Video editing tool UIs (DaVinci Resolve, Premiere Pro)

3. **Document Findings:**
   - Add at least 5-10 design inspiration links
   - Note color palettes (hex codes) - focus on cosmic/space themes
   - Note typography choices
   - Note motion/animation styles
   - Note layout patterns

4. **Share with Pedro:**
   - Create a summary document
   - Highlight top 3-5 designs that match the Cosmiv vision
   - Suggest specific UI improvements based on research

**Documentation Help:**
- Ask ChatGPT: "Best modern gaming dashboard UI designs"
- Ask ChatGPT: "Color palette suggestions for AI video editing tools"
- Ask ChatGPT: "Motion design trends for gaming applications"
- Ask ChatGPT: "Cosmic/space-themed UI design inspirations"

---

### 📋 Additional Tasks

#### Environment Variables Checklist

Create a checklist of all environment variables that need to be set in production:

- OAuth credentials (Steam, Xbox, PSN, Nintendo)
- Stripe keys
- Database connection strings
- S3/MinIO storage credentials
- JWT secret key
- API keys for AI services (OpenAI, Anthropic, etc.)

Location: Ask Pedro where production `.env` file should be stored

#### API Documentation Review

- Review each platform's API documentation
- Note rate limits
- Note authentication requirements
- Document any special setup steps

---

## 🧭 If You Don't Know What To Do

1. **Ask ChatGPT first** - it's great for:

   - Explaining how OAuth flows work
   - Step-by-step setup guides
   - API documentation summaries
   - Design research queries

2. **Document everything** - add findings to this file or create notes files

3. **Ask Pedro (`pmec`)** when:
   - You need access to developer accounts
   - You need to test something that requires code changes
   - A major milestone is complete and needs verification
   - You're blocked and need technical help

---

## 🪜 Progress Log

| Date       | Task                        | Status | Notes                                         |
| ---------- | --------------------------- | ------ | --------------------------------------------- |
| 2025-01-27 | Initial TODO list created   | ✅     | Agent generated tasks                         |
| 2025-01-27 | OAuth infrastructure review | ⚙️     | Found mock implementations, need credentials  |
| 2025-01-27 | Billing system review       | ⚙️     | Stripe structure exists, needs webhook config |
| 2025-01-27 | OAuth integration brief     | ✅     | Created `docs/INTEGRATION_READINESS.md` - comprehensive setup guide for all platforms |
| 2025-01-27 | Billing provider comparison | ✅     | Created `docs/BILLING_PROVIDER_COMPARISON.md` - Stripe recommended vs Paddle/Xsolla |
| 2025-01-27 | Hosting platform comparison | ✅     | Created `docs/HOSTING_COMPARISON.md` - Fly.io recommended, compares 4 platforms with pricing |
| 2025-01-27 | Weekly montage automation   | ✅     | Created `docs/WEEKLY_MONTAGE_AUTOMATION.md` - comprehensive flow documentation |
| 2025-01-27 | Notification system recommendations | ✅     | Created `docs/NOTIFICATION_SYSTEM.md` - Slack/Email recommendations for alerts |

---

## 📝 Notes

- All OAuth integrations are in **mock mode** by default
- To enable real OAuth, set `*_API_ENABLED=true` in environment variables
- Stripe billing has the structure ready, just needs live keys + webhooks
- Design research is completely new - create the folder and start collecting

---

_Next agent run will update this file with new tasks based on progress._
