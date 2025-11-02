# 🔒 Security Guide for Public Repository

## ⚠️ BEFORE MAKING REPOSITORY PUBLIC - CHECKLIST

### ✅ Critical Files That MUST Be Excluded

These files **MUST NEVER** be committed to the repository:

- [x] `.env` files (any `.env`, `.env.local`, `.env.production`, etc.)
- [x] Database files (`*.db`, `*.sqlite3`, `*.sqlite`)
- [x] Private keys (`*.pem`, `*.key`, `*.p12`)
- [x] Credentials files (`credentials.json`, `secrets.json`)
- [x] User uploads (`backend/storage/uploads/**`)
- [x] Generated exports (`backend/storage/exports/**`)
- [x] Docker volumes containing data
- [x] Backend cache files (`__pycache__/`, `*.pyc`)
- [x] Node modules (`node_modules/`)

### ✅ Hardcoded Secrets Review

These are **development defaults only** - safe for public repo:

- ✅ `JWT_SECRET_KEY` default: `"dev-secret-key-change-in-production-123456789"`
  - **⚠️ MUST** be changed via `JWT_SECRET_KEY` environment variable in production
- ✅ Docker compose defaults (`postgres/postgres`, `minioadmin/minioadmin`)
  - Safe - these are development-only credentials
- ✅ SQLite database path is configured, but database file is gitignored

### ✅ Environment Variables Required

All sensitive configuration uses environment variables:

| Variable                    | Purpose             | Required             | Safe Default?                |
| --------------------------- | ------------------- | -------------------- | ---------------------------- |
| `JWT_SECRET_KEY`            | JWT token signing   | **YES** (production) | ❌ No default for production |
| `STRIPE_SECRET_KEY`         | Stripe payments     | Optional             | ✅ Empty by default          |
| `STRIPE_WEBHOOK_SECRET`     | Stripe webhooks     | Optional             | ✅ Empty by default          |
| `POSTGRES_DSN`              | Database connection | Optional             | ✅ Dev default OK            |
| `S3_SECRET_KEY`             | Object storage      | Optional             | ✅ Dev default OK            |
| `STEAM_API_KEY`             | Steam API           | Optional             | ✅ Empty by default          |
| `XBOX_CLIENT_SECRET`        | Xbox OAuth          | Optional             | ✅ Empty by default          |
| `PLAYSTATION_CLIENT_SECRET` | PSN OAuth           | Optional             | ✅ Empty by default          |
| `NINTENDO_CLIENT_SECRET`    | Nintendo OAuth      | Optional             | ✅ Empty by default          |
| `SUNO_API_KEY`              | Suno music API      | Optional             | ✅ Empty by default          |
| `MUBERT_API_KEY`            | Mubert music API    | Optional             | ✅ Empty by default          |

### ✅ Files Safe to Commit

These files are **safe** to include in public repository:

- ✅ `env.production.example` - Template file with placeholders
- ✅ `docker-compose.yml` - Development defaults only
- ✅ `config.py` - Uses environment variables
- ✅ Source code (no hardcoded real secrets)
- ✅ Documentation files

## 🛡️ Production Deployment Security

### Before Deploying to Production:

1. **Generate Strong JWT Secret:**

   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Set Environment Variables:**

   - Use your hosting platform's secrets management
   - Never commit `.env` files
   - Use `env.production.example` as a template

3. **Database Security:**

   - Use strong PostgreSQL passwords
   - Enable SSL/TLS connections
   - Restrict database access to backend only

4. **API Keys:**

   - Generate new keys for each service
   - Rotate keys regularly
   - Use separate keys for dev/staging/production

5. **CORS Configuration:**
   - Only allow your frontend domain
   - Never use `*` in production

## 🔍 Security Audit Commands

Before making repository public, run these checks:

```bash
# Check for accidentally committed secrets
git log --all --full-history --source -- "*password*" "*secret*" "*key*"

# Verify .gitignore is working
git status --ignored

# Check for database files
find . -name "*.db" -o -name "*.sqlite*"

# Check for env files
find . -name ".env*" ! -name "*.example"
```

## 📋 Post-Public Checklist

After making repository public:

- [ ] Verify no sensitive data in git history
- [ ] Review GitHub repository settings
- [ ] Enable branch protection (require PR reviews)
- [ ] Set up Dependabot for security updates
- [ ] Review GitHub Actions secrets (if any)
- [ ] Monitor for accidental secret exposure

## 🚨 If Secrets Are Accidentally Committed

If sensitive data is accidentally committed:

1. Immediately rotate all exposed secrets
2. Remove sensitive files from git history using standard git history cleaning tools
3. Force push changes (coordinate with team first)
4. Inform affected users if passwords/tokens were exposed

## 📚 Best Practices

1. **Never commit:**

   - Real API keys
   - Database passwords
   - Private keys
   - User data
   - Production credentials

2. **Always use:**

   - Environment variables for secrets
   - `.gitignore` for sensitive files
   - Template files (`.example`) for configuration
   - Strong, unique passwords in production

3. **Review before committing:**
   - Check `git diff` before `git add`
   - Review sensitive file changes carefully
   - Use pre-commit hooks if possible

## ✅ This Repository's Security Status

- ✅ No `.env` files committed
- ✅ Database files are gitignored
- ✅ All secrets use environment variables
- ✅ Development defaults use safe placeholders
- ✅ Example files use placeholders

---

**Last Updated:** 2025-01-27
**Security Level:** Safe for public repository (after verifying checklist)
