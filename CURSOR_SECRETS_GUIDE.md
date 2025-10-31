# 🎯 Cursor Secrets Configuration Guide

## Quick Reference: User Secrets vs Team Secrets

### 👤 User Secrets (Personal API Keys)
**Location:** Cursor Settings → User Secrets

These are **personal API keys** that each developer manages individually:

```env
# Gaming Platform APIs (User Secret)
STEAM_API_KEY=YOUR_PERSONAL_STEAM_KEY
STEAM_WEB_API_KEY=YOUR_PERSONAL_STEAM_WEB_KEY
XBOX_CLIENT_ID=YOUR_PERSONAL_XBOX_CLIENT_ID
XBOX_CLIENT_SECRET=YOUR_PERSONAL_XBOX_SECRET
PSN_NPSSO_TOKEN=YOUR_PERSONAL_PSN_TOKEN
NINTENDO_SESSION_TOKEN=YOUR_PERSONAL_NINTENDO_TOKEN

# AI/ML Services (User Secret)
OPENAI_API_KEY=YOUR_PERSONAL_OPENAI_KEY

# Personal Analytics (User Secret)
VITE_GOOGLE_ANALYTICS_ID=YOUR_PERSONAL_GA_ID
VITE_MIXPANEL_TOKEN=YOUR_PERSONAL_MIXPANEL_TOKEN
```

**Why User Secrets?**
- Personal API quotas and billing
- Individual developer accounts
- Testing with personal credentials
- No shared quota conflicts

---

### 👥 Team Secrets (Shared Infrastructure)
**Location:** Cursor Settings → Team Secrets

These are **shared configurations** that the entire team uses:

```env
# Database (Team Secret)
POSTGRES_DSN=postgresql+psycopg://postgres:PASSWORD@host:5432/aiditor
DB_PATH=/app/storage/db.sqlite3

# Redis/Broker (Team Secret)
REDIS_URL=redis://redis:6379/0

# Object Storage (Team Secret)
S3_ENDPOINT_URL=http://minio:9000
S3_ACCESS_KEY=SHARED_ACCESS_KEY
S3_SECRET_KEY=SHARED_SECRET_KEY
S3_BUCKET=aiditor
S3_PUBLIC_BASE_URL=http://localhost:9000/aiditor

# Billing & Payments (Team Secret)
STRIPE_SECRET_KEY=sk_test_TEAM_STRIPE_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_TEAM_STRIPE_KEY
STRIPE_WEBHOOK_SECRET=whsec_TEAM_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID=price_TEAM_PRICE_ID

# Authentication & Security (Team Secret)
JWT_SECRET_KEY=SHARED_JWT_SECRET_DO_NOT_SHARE_PUBLICLY
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
SESSION_SECRET=SHARED_SESSION_SECRET_DO_NOT_SHARE_PUBLICLY

# Email/Notifications (Team Secret)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=TEAM_SMTP_USER
SMTP_PASSWORD=TEAM_SMTP_PASSWORD
SMTP_FROM_EMAIL=noreply@aiditor.com

# Monitoring & Analytics (Team Secret)
SENTRY_DSN=https://TEAM_SENTRY_KEY@sentry.io/PROJECT_ID
ANALYTICS_API_KEY=TEAM_ANALYTICS_KEY

# Frontend Public Keys (Team Secret)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_TEAM_STRIPE_KEY
VITE_SENTRY_DSN=https://TEAM_SENTRY_KEY@sentry.io/FRONTEND_PROJECT_ID
```

**Why Team Secrets?**
- Shared infrastructure (DB, Redis, S3)
- Team billing accounts (Stripe)
- Shared monitoring (Sentry)
- Consistent configuration across team

---

## 📝 Step-by-Step Setup

### Step 1: Configure User Secrets

1. **Open Cursor Settings**
   - Mac: `Cmd + ,`
   - Windows/Linux: `Ctrl + ,`

2. **Navigate to User Secrets**
   - Look for "User Secrets" in the settings sidebar

3. **Add Your Personal Keys**
   ```env
   STEAM_API_KEY=your_actual_steam_key_here
   OPENAI_API_KEY=sk-your_actual_openai_key_here
   ```

4. **Save Settings**

### Step 2: Configure Team Secrets

1. **Open Cursor Settings**
   - Mac: `Cmd + ,`
   - Windows/Linux: `Ctrl + ,`

2. **Navigate to Team Secrets**
   - Look for "Team Secrets" in the settings sidebar
   - May require team admin permissions

3. **Add Shared Infrastructure Keys**
   ```env
   STRIPE_SECRET_KEY=sk_test_team_key_here
   JWT_SECRET_KEY=your_generated_jwt_secret_here
   POSTGRES_DSN=postgresql+psycopg://user:pass@host:5432/aiditor
   ```

4. **Save Settings**

### Step 3: Create Local .env Files

Even with Cursor Secrets configured, you should create local `.env` files for running the application:

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

**Frontend:**
```bash
cd /workspace
cp .env.example .env
# Edit .env with your values
```

---

## 🔄 How Cursor Secrets Work with .env Files

Cursor Secrets **complement** `.env` files, they don't replace them:

1. **Cursor Secrets** → Used by Cursor AI agents when making changes
2. **`.env` files** → Used by your application at runtime

**Best Practice:**
- Keep both synchronized
- Use Cursor Secrets for AI agent access
- Use `.env` files for local development

---

## 🔐 Secret Namespacing

All secrets should be properly namespaced to avoid conflicts:

### ✅ Good Namespacing
```env
# Clear, specific names
AIDIT_STRIPE_SECRET_KEY=sk_test_xxx
AIDIT_JWT_SECRET=xxx
AIDIT_DB_PASSWORD=xxx

# Or use existing prefixes
STRIPE_SECRET_KEY=sk_test_xxx
JWT_SECRET_KEY=xxx
POSTGRES_DSN=postgresql://xxx
```

### ❌ Bad Namespacing
```env
# Too generic, could conflict
API_KEY=xxx
SECRET=xxx
PASSWORD=xxx
TOKEN=xxx
```

---

## 🚨 Security Checklist

### Before Committing Code:
- [ ] No secrets in source code
- [ ] `.env` files are in `.gitignore`
- [ ] Only `.env.example` files are committed
- [ ] All secrets use placeholders in examples
- [ ] No hardcoded API keys or passwords

### When Sharing with Team:
- [ ] Team Secrets are configured in Cursor
- [ ] Documentation explains which secrets are needed
- [ ] No secrets shared via chat/email
- [ ] Team members know how to access Team Secrets

### For Production:
- [ ] Different secrets for dev/staging/prod
- [ ] Strong, randomly generated secrets
- [ ] Secrets rotation policy in place
- [ ] Monitoring for secret access/leaks

---

## 🎯 Quick Decision Tree

**"Should this be a User Secret or Team Secret?"**

```
Is this a personal API key?
├─ YES → User Secret
│  └─ Examples: Personal Steam key, personal OpenAI key
│
└─ NO → Is it shared infrastructure?
   ├─ YES → Team Secret
   │  └─ Examples: Database, Stripe, JWT secret
   │
   └─ NO → Is it environment-specific?
      ├─ YES → .env file (not in Cursor Secrets)
      │  └─ Examples: Local paths, dev vs prod URLs
      │
      └─ UNSURE → Ask team lead
```

---

## 🔍 Validation

To verify your secrets are configured correctly:

### Backend Validation
```bash
cd backend/src
python -c "from config import settings; print('✅ Config loaded successfully')"
```

### Check Required Secrets
```bash
cd backend/src
python -c "
from config import settings
required = ['JWT_SECRET_KEY', 'SESSION_SECRET']
missing = [k for k in required if not getattr(settings, k)]
if missing:
    print(f'❌ Missing: {missing}')
else:
    print('✅ All required secrets configured')
"
```

---

## 📚 Common Scenarios

### Scenario 1: New Developer Onboarding
1. Clone repository
2. Copy `.env.example` to `.env` in both root and backend
3. Configure User Secrets in Cursor (personal keys)
4. Get Team Secrets access from team lead
5. Fill in `.env` files with actual values
6. Run validation scripts

### Scenario 2: Adding a New Secret
1. Add to `config.py` with proper typing
2. Add to `.env.example` with placeholder
3. Update `SECRETS_MANAGEMENT.md` documentation
4. Decide: User Secret or Team Secret?
5. Add to appropriate Cursor Secrets location
6. Notify team if it's a Team Secret

### Scenario 3: Rotating a Secret
1. Generate new secret value
2. Update in Cursor Team Secrets
3. Update in all `.env` files
4. Restart services
5. Verify functionality
6. Revoke old secret

---

## 🆘 Troubleshooting

### "Cursor Agent can't access my secrets"
- Check that secrets are in **Team Secrets**, not just User Secrets
- Verify secret names match exactly (case-sensitive)
- Ensure you're in the correct workspace

### "Application can't find environment variables"
- Check that `.env` file exists in the correct directory
- Verify `.env` file has correct variable names
- Ensure no extra spaces or quotes around values
- Check file permissions (should be readable)

### "Secrets not synchronized"
- Cursor Secrets and `.env` files are separate
- Update both when making changes
- Use validation scripts to check consistency

---

## 📞 Getting Help

1. **Check Documentation**: Review `SECRETS_MANAGEMENT.md`
2. **Validate Configuration**: Run validation scripts
3. **Check Examples**: Review `.env.example` files
4. **Ask Team Lead**: For Team Secrets access
5. **Security Issue**: Report immediately to team lead

---

## 🔐 Remember

- **NEVER** commit `.env` files
- **NEVER** share secrets in chat/email
- **NEVER** hardcode secrets in code
- **ALWAYS** use placeholders in examples
- **ALWAYS** validate before deploying
- **ALWAYS** rotate secrets regularly

---

*Last Updated: 2025-10-31*
