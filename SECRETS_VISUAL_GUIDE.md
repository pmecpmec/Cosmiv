# 🎨 AIDIT Secrets Management - Visual Guide

## 🗺️ Secret Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    AIDIT Application                         │
│                                                              │
│  ┌────────────────┐              ┌────────────────┐        │
│  │    Frontend    │              │    Backend     │        │
│  │   (React/Vite) │              │    (FastAPI)   │        │
│  └────────┬───────┘              └────────┬───────┘        │
│           │                               │                 │
│           │ Loads .env                    │ Loads .env      │
│           ↓                               ↓                 │
│  ┌────────────────┐              ┌────────────────┐        │
│  │ VITE_* vars    │              │  config.py     │        │
│  │ (Public only)  │              │  (Settings)    │        │
│  └────────────────┘              └────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                           ↑
                           │ Reads from
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
   ┌────▼─────┐                      ┌───────▼────┐
   │   .env   │                      │   .env     │
   │ Frontend │                      │  Backend   │
   └────┬─────┘                      └───────┬────┘
        │                                    │
        │ Created from                       │ Created from
        │                                    │
   ┌────▼─────────┐                  ┌──────▼────────┐
   │ .env.example │                  │ .env.example  │
   │  (Template)  │                  │   (Template)  │
   └──────────────┘                  └───────────────┘
```

## 🔐 Secret Categories Hierarchy

```
AIDIT Secrets
│
├── 👥 Team Secrets (Shared Infrastructure)
│   │
│   ├── 🗄️  Database
│   │   ├── POSTGRES_DSN
│   │   └── DB_PATH
│   │
│   ├── 🔄 Redis/Broker
│   │   └── REDIS_URL
│   │
│   ├── 📦 Object Storage (S3/MinIO)
│   │   ├── S3_ENDPOINT_URL
│   │   ├── S3_ACCESS_KEY
│   │   ├── S3_SECRET_KEY
│   │   ├── S3_BUCKET
│   │   └── S3_PUBLIC_BASE_URL
│   │
│   ├── 💳 Billing (Stripe)
│   │   ├── STRIPE_SECRET_KEY
│   │   ├── STRIPE_PUBLISHABLE_KEY
│   │   ├── STRIPE_WEBHOOK_SECRET
│   │   └── STRIPE_PRO_PRICE_ID
│   │
│   ├── 🔒 Security
│   │   ├── JWT_SECRET_KEY
│   │   ├── SESSION_SECRET
│   │   └── JWT_ALGORITHM
│   │
│   ├── 📧 Email (SMTP)
│   │   ├── SMTP_HOST
│   │   ├── SMTP_PORT
│   │   ├── SMTP_USER
│   │   └── SMTP_PASSWORD
│   │
│   └── 📊 Monitoring
│       ├── SENTRY_DSN
│       └── ANALYTICS_API_KEY
│
└── 👤 User Secrets (Personal Keys)
    │
    ├── 🎮 Gaming Platforms
    │   ├── STEAM_API_KEY
    │   ├── XBOX_CLIENT_ID
    │   ├── XBOX_CLIENT_SECRET
    │   ├── PSN_NPSSO_TOKEN
    │   └── NINTENDO_SESSION_TOKEN
    │
    ├── 🤖 AI/ML Services
    │   ├── OPENAI_API_KEY
    │   └── WHISPER_MODEL_PATH
    │
    └── 📈 Personal Analytics
        ├── VITE_GOOGLE_ANALYTICS_ID
        └── VITE_MIXPANEL_TOKEN
```

## 🔄 Secret Lifecycle

```
┌─────────────┐
│   Create    │  Generate new secret value
│   Secret    │  (use secure random generator)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Categorize │  Decide: User Secret or Team Secret?
│   Secret    │  
└──────┬──────┘
       │
       ├─→ User Secret ─→ Cursor Settings → User Secrets
       │
       └─→ Team Secret ─→ Cursor Settings → Team Secrets
       │
       ↓
┌─────────────┐
│   Add to    │  Add to .env file
│  .env File  │  (for runtime use)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Validate   │  Run: python validate_secrets.py
│   Secret    │  
└──────┬──────┘
       │
       ↓
┌─────────────┐
│     Use     │  Application loads and uses secret
│   Secret    │  
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Rotate    │  Quarterly or when compromised
│   Secret    │  Generate new → Update → Revoke old
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Revoke    │  Disable old secret value
│   Secret    │  
└─────────────┘
```

## 🎯 Decision Tree: Where to Store?

```
                    Need to store a secret?
                            │
                            ↓
                    ┌───────────────┐
                    │ Is it a       │
                    │ secret value? │
                    └───────┬───────┘
                            │
                ┌───────────┴───────────┐
                │                       │
               YES                     NO
                │                       │
                ↓                       ↓
        ┌──────────────┐        ┌─────────────┐
        │ Is it        │        │ Regular     │
        │ personal?    │        │ config var  │
        └──────┬───────┘        │ (.env only) │
               │                └─────────────┘
       ┌───────┴───────┐
       │               │
      YES             NO
       │               │
       ↓               ↓
┌─────────────┐  ┌──────────────┐
│ User Secret │  │ Is it shared │
│             │  │ by team?     │
│ Examples:   │  └──────┬───────┘
│ • Your      │         │
│   Steam key │   ┌─────┴─────┐
│ • Your      │   │           │
│   OpenAI    │  YES         NO
│   key       │   │           │
└─────────────┘   ↓           ↓
           ┌──────────┐  ┌─────────┐
           │  Team    │  │  .env   │
           │  Secret  │  │  only   │
           │          │  └─────────┘
           │ Examples:│
           │ • DB     │
           │ • Stripe │
           │ • JWT    │
           └──────────┘
```

## 📋 Setup Workflow

```
New Developer Onboarding
│
├─ Step 1: Clone Repository
│  └─ git clone <repo>
│
├─ Step 2: Create .env Files
│  ├─ cd backend
│  ├─ cp .env.example .env
│  ├─ cd ..
│  └─ cp .env.example .env
│
├─ Step 3: Configure Cursor User Secrets
│  ├─ Open Cursor Settings (Cmd/Ctrl + ,)
│  ├─ Navigate to "User Secrets"
│  └─ Add personal API keys:
│     ├─ STEAM_API_KEY=your_key
│     └─ OPENAI_API_KEY=your_key
│
├─ Step 4: Get Team Secrets Access
│  ├─ Contact team lead
│  └─ Get access to Team Secrets
│
├─ Step 5: Fill .env Files
│  ├─ Edit backend/.env
│  └─ Edit .env (frontend)
│
├─ Step 6: Validate Configuration
│  ├─ cd backend
│  └─ python validate_secrets.py
│
└─ Step 7: Start Development
   ├─ Backend: docker-compose up -d
   └─ Frontend: npm run dev
```

## 🔒 Security Layers

```
┌─────────────────────────────────────────────────┐
│         Layer 4: Monitoring & Auditing          │
│  • Sentry error tracking                        │
│  • Access logs                                  │
│  • Secret usage monitoring                      │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│         Layer 3: Validation & Testing           │
│  • validate_secrets.py script                   │
│  • Required secret checks                       │
│  • Insecure default detection                   │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│         Layer 2: Access Control                 │
│  • User Secrets (personal)                      │
│  • Team Secrets (shared)                        │
│  • Environment separation (dev/staging/prod)    │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│         Layer 1: Prevention                     │
│  • .gitignore (prevents commits)                │
│  • .env.example (templates only)                │
│  • No hardcoded secrets                         │
│  • Secret masking in output                     │
└─────────────────────────────────────────────────┘
```

## 📊 Validation Process

```
Run: python validate_secrets.py
│
├─ Check Environment
│  ├─ DEBUG mode?
│  ├─ USE_POSTGRES?
│  ├─ USE_OBJECT_STORAGE?
│  └─ USE_HIGHLIGHT_MODEL?
│
├─ Validate Required Secrets
│  ├─ JWT_SECRET_KEY (if production)
│  ├─ SESSION_SECRET (if production)
│  ├─ STRIPE_SECRET_KEY (if billing enabled)
│  ├─ POSTGRES_DSN (if USE_POSTGRES=true)
│  └─ S3_SECRET_KEY (if USE_OBJECT_STORAGE=true)
│
├─ Check Optional Secrets
│  ├─ Gaming APIs
│  ├─ AI/ML Services
│  ├─ Email (SMTP)
│  └─ Monitoring
│
├─ Detect Insecure Defaults
│  ├─ "minioadmin" in S3 keys?
│  ├─ "postgres:postgres" in DSN?
│  └─ Default JWT secrets?
│
└─ Generate Report
   ├─ ✅ Success: All required secrets configured
   ├─ ⚠️  Warning: Optional features missing
   └─ ❌ Error: Required secrets missing
```

## 🎨 Color Coding

Throughout the documentation and validation script:

- 🟢 **Green (✅)** - Configured and secure
- 🟡 **Yellow (⚠️)** - Warning or optional
- 🔴 **Red (❌)** - Error or missing required
- 🔵 **Blue (ℹ️)** - Information
- ⚪ **White (⚪)** - Not configured (optional)

## 📁 File Relationships

```
Configuration Files
│
├─ .env.example (Template)
│  ├─ Committed to git ✅
│  ├─ Contains placeholders
│  └─ Safe to share
│
├─ .env (Actual Secrets)
│  ├─ NOT committed ❌
│  ├─ Contains real values
│  └─ Never share
│
├─ config.py (Loader)
│  ├─ Reads .env file
│  ├─ Provides type safety
│  └─ Exports settings object
│
├─ validate_secrets.py (Validator)
│  ├─ Checks configuration
│  ├─ Validates secrets
│  └─ Reports status
│
└─ .gitignore (Protection)
   ├─ Blocks .env files
   ├─ Blocks secret files
   └─ Allows .env.example
```

## 🚀 Quick Commands

```bash
# Setup
cp .env.example .env           # Create config file
vim .env                       # Edit with your values

# Validate
python validate_secrets.py    # Check configuration

# Generate Secrets
python -c "import secrets; print(secrets.token_urlsafe(32))"  # JWT
python -c "import secrets; print(secrets.token_hex(32))"      # Session
openssl rand -base64 32        # General

# Check Status
python -c "from config import settings; print('✅ OK')"  # Quick check

# Development
docker-compose up -d           # Start backend
npm run dev                    # Start frontend
```

## 📞 Help Resources

```
Need Help?
│
├─ Quick Answer?
│  └─ Check: SECRETS_QUICK_REFERENCE.md
│
├─ Cursor Setup?
│  └─ Check: CURSOR_SECRETS_GUIDE.md
│
├─ Complete Guide?
│  └─ Check: SECRETS_MANAGEMENT.md
│
├─ Validation Issues?
│  └─ Check: backend/README_VALIDATION.md
│
└─ Still Stuck?
   └─ Ask team lead
```

---

*Visual guide for AIDIT secrets management*
*Last updated: 2025-10-31*
