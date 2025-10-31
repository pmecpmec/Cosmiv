# 🔐 AIDIT Secrets Quick Reference Card

## 🚀 Quick Start (New Developer)

```bash
# 1. Clone and setup
git clone <repo>
cd aidit

# 2. Backend setup
cd backend
cp .env.example .env
# Edit .env with your values

# 3. Frontend setup  
cd ..
cp .env.example .env
# Edit .env with your values

# 4. Configure Cursor Secrets (see below)

# 5. Validate
cd backend
python validate_secrets.py
```

---

## 📋 Cursor Secrets Cheat Sheet

### 👤 User Secrets (Your Personal Keys)
**Cursor Settings → User Secrets**

```env
# Gaming (get your own keys)
STEAM_API_KEY=your_key
XBOX_CLIENT_ID=your_id
XBOX_CLIENT_SECRET=your_secret
PSN_NPSSO_TOKEN=your_token
NINTENDO_SESSION_TOKEN=your_token

# AI/ML
OPENAI_API_KEY=sk-your_key
```

### 👥 Team Secrets (Shared by Team)
**Cursor Settings → Team Secrets**

```env
# Database
POSTGRES_DSN=postgresql+psycopg://user:pass@host:5432/aiditor

# Redis
REDIS_URL=redis://redis:6379/0

# S3/MinIO
S3_ACCESS_KEY=shared_key
S3_SECRET_KEY=shared_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_shared
STRIPE_WEBHOOK_SECRET=whsec_shared

# Security
JWT_SECRET_KEY=shared_jwt_secret
SESSION_SECRET=shared_session_secret

# Email
SMTP_USER=team@example.com
SMTP_PASSWORD=shared_password
```

---

## 🎯 Decision Tree

```
Need to configure a secret?
│
├─ Is it a personal API key?
│  └─ YES → User Secrets
│     Examples: Your Steam key, your OpenAI key
│
├─ Is it shared infrastructure?
│  └─ YES → Team Secrets
│     Examples: Database, Stripe, JWT
│
└─ Is it environment-specific?
   └─ YES → .env file only
      Examples: Local paths, dev URLs
```

---

## 🔒 Security Checklist

### Before Every Commit
- [ ] No secrets in code
- [ ] `.env` not committed
- [ ] Only `.env.example` committed
- [ ] Placeholders in examples

### Before Every Deploy
- [ ] Run `python validate_secrets.py`
- [ ] All required secrets configured
- [ ] Strong secrets (not defaults)
- [ ] Different secrets per environment

---

## 🔑 Generate Secrets

```bash
# JWT Secret
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Session Secret
python -c "import secrets; print(secrets.token_hex(32))"

# General Random
openssl rand -base64 32
```

---

## ✅ Validation Commands

```bash
# Validate all secrets
cd backend
python validate_secrets.py

# Quick check
python -c "from config import settings; print('✅ OK')"

# Check specific secret (safe, won't expose value)
python -c "from config import settings; print('Stripe:', bool(settings.STRIPE_SECRET_KEY))"
```

---

## 🚨 Emergency Procedures

### Secret Leaked
1. **Immediately** revoke the secret
2. Generate new secret
3. Update Team Secrets
4. Update all `.env` files
5. Restart all services
6. Notify team

### Can't Access Secrets
1. Check `.env` file exists
2. Check Cursor Secrets configured
3. Verify variable names (case-sensitive)
4. Run validation script
5. Ask team lead for Team Secrets access

---

## 📁 File Locations

```
/workspace/
├── .env.example              # Frontend template ✅ commit
├── .env                      # Frontend secrets ❌ never commit
├── backend/
│   ├── .env.example         # Backend template ✅ commit
│   ├── .env                 # Backend secrets ❌ never commit
│   ├── validate_secrets.py  # Validation script
│   └── src/
│       └── config.py        # Configuration loader
├── SECRETS_MANAGEMENT.md     # Full documentation
├── CURSOR_SECRETS_GUIDE.md   # Cursor setup guide
└── SECRETS_QUICK_REFERENCE.md # This file
```

---

## 🔍 Common Issues

| Issue | Solution |
|-------|----------|
| "Missing JWT_SECRET_KEY" | Add to Team Secrets + .env |
| "Can't connect to DB" | Check POSTGRES_DSN in .env |
| "Stripe not working" | Add STRIPE_SECRET_KEY to Team Secrets |
| "Gaming API fails" | Add your personal keys to User Secrets |
| ".env not found" | Copy from .env.example |

---

## 📞 Get Help

1. Check `SECRETS_MANAGEMENT.md` (full docs)
2. Check `CURSOR_SECRETS_GUIDE.md` (Cursor setup)
3. Run `python validate_secrets.py`
4. Ask team lead

---

## 🎓 Remember

| ✅ DO | ❌ DON'T |
|-------|----------|
| Use .env.example as template | Commit .env files |
| Store personal keys in User Secrets | Share secrets in chat |
| Store shared keys in Team Secrets | Hardcode secrets in code |
| Rotate secrets regularly | Use production secrets in dev |
| Validate before deploying | Log secret values |
| Use strong random secrets | Use default/weak secrets |

---

## 📊 Required vs Optional

### Required (Production)
- `JWT_SECRET_KEY` - Authentication
- `SESSION_SECRET` - Sessions
- `STRIPE_SECRET_KEY` - Billing (if enabled)
- `POSTGRES_DSN` - Database (if USE_POSTGRES=true)
- `S3_SECRET_KEY` - Storage (if USE_OBJECT_STORAGE=true)

### Optional (Features)
- Gaming APIs - Social features
- OpenAI - AI features
- SMTP - Email notifications
- Sentry - Error tracking

---

*Quick reference for AIDIT secrets management*
*Last updated: 2025-10-31*
