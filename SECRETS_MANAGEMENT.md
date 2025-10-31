# 🔐 AIDIT Secrets & Environment Management

## Overview

This document outlines how to manage secrets and environment variables for the AIDIT project using Cursor's built-in secrets management system.

## 🎯 Secret Categories

### Team Secrets (Shared Across Team)
These are shared configurations that the entire team needs:

- **Database**: `POSTGRES_DSN`, `DB_PATH`
- **Redis/Broker**: `REDIS_URL`
- **Object Storage**: `S3_ENDPOINT_URL`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_PUBLIC_BASE_URL`
- **Billing**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`
- **Security**: `JWT_SECRET_KEY`, `SESSION_SECRET`
- **Email**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- **Monitoring**: `SENTRY_DSN`, `ANALYTICS_API_KEY`

### User Secrets (Personal/Individual)
These are personal API keys that each developer manages:

- **Gaming APIs**: `STEAM_API_KEY`, `XBOX_CLIENT_ID`, `PSN_NPSSO_TOKEN`, `NINTENDO_SESSION_TOKEN`
- **AI/ML Services**: `OPENAI_API_KEY`
- **Personal Analytics**: Individual analytics tokens

## 📋 Setup Instructions

### 1. Backend Environment Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in the required values. **NEVER commit this file to git.**

### 2. Frontend Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values for the frontend.

### 3. Cursor Secrets Configuration

#### Setting User Secrets (Personal Keys)
1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Navigate to "User Secrets"
3. Add your personal API keys:
   ```
   STEAM_API_KEY=your_personal_steam_key
   OPENAI_API_KEY=your_personal_openai_key
   ```

#### Setting Team Secrets (Shared Keys)
1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Navigate to "Team Secrets"
3. Add shared configuration:
   ```
   STRIPE_SECRET_KEY=sk_test_xxxxx
   JWT_SECRET_KEY=your_jwt_secret
   POSTGRES_DSN=postgresql+psycopg://user:pass@host:port/db
   ```

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Use `.env.example` as a template (committed to git)
- ✅ Store actual secrets in `.env` (NOT committed to git)
- ✅ Use User Secrets for personal API keys
- ✅ Use Team Secrets for shared infrastructure
- ✅ Rotate secrets regularly
- ✅ Use different secrets for dev/staging/production
- ✅ Validate required secrets on application startup
- ✅ Use strong, randomly generated secrets for JWT and sessions

### ❌ DON'T:
- ❌ NEVER commit `.env` files to git
- ❌ NEVER hardcode secrets in source code
- ❌ NEVER share secrets via chat/email
- ❌ NEVER use production secrets in development
- ❌ NEVER log secret values
- ❌ NEVER expose secrets in error messages
- ❌ NEVER commit secrets to public repositories

## 🔍 Environment Variable Validation

The application validates required environment variables on startup. Missing critical secrets will cause the application to fail with clear error messages.

### Required for Production:
- `JWT_SECRET_KEY` - Must be set for authentication
- `SESSION_SECRET` - Must be set for session management
- `STRIPE_SECRET_KEY` - Required if billing is enabled
- `POSTGRES_DSN` - Required if `USE_POSTGRES=true`
- `S3_ACCESS_KEY`, `S3_SECRET_KEY` - Required if `USE_OBJECT_STORAGE=true`

## 🔐 Generating Secure Secrets

### JWT Secret Key
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Session Secret
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### General Random String
```bash
openssl rand -base64 32
```

## 📝 Environment Variables Reference

### Backend Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `USE_POSTGRES` | bool | false | Enable PostgreSQL database |
| `USE_OBJECT_STORAGE` | bool | false | Enable S3/MinIO storage |
| `USE_HIGHLIGHT_MODEL` | bool | false | Enable ML highlight detection |
| `FREEMIUM_MAX_DURATION` | int | 60 | Max video duration for free users |
| `WATERMARK_TEXT` | string | "Aiditor Free" | Watermark text for free tier |
| `DB_PATH` | string | /app/storage/db.sqlite3 | SQLite database path |
| `POSTGRES_DSN` | string | - | PostgreSQL connection string |
| `REDIS_URL` | string | redis://redis:6379/0 | Redis connection URL |
| `S3_ENDPOINT_URL` | string | - | S3/MinIO endpoint |
| `S3_ACCESS_KEY` | string | - | S3 access key |
| `S3_SECRET_KEY` | string | - | S3 secret key |
| `S3_BUCKET` | string | aiditor | S3 bucket name |
| `STRIPE_SECRET_KEY` | string | - | Stripe secret key |
| `JWT_SECRET_KEY` | string | - | JWT signing secret |
| `DEBUG` | bool | false | Enable debug mode |
| `LOG_LEVEL` | string | INFO | Logging level |

### Frontend Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_API_BASE_URL` | string | http://localhost:8000 | Backend API URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | string | - | Stripe public key |
| `VITE_ENABLE_SOCIAL_FEATURES` | bool | true | Enable social features |
| `VITE_ENABLE_BILLING` | bool | true | Enable billing features |
| `VITE_SENTRY_DSN` | string | - | Sentry DSN for error tracking |

## 🚀 Deployment

### Docker Compose
The `docker-compose.yml` file references environment variables. Ensure your `.env` file is properly configured before running:

```bash
cd backend
docker-compose up -d
```

### Production Deployment
For production deployments:

1. **Never use default secrets** - Generate new, strong secrets
2. **Use environment-specific configs** - Separate dev/staging/prod
3. **Enable all security features** - Set `DEBUG=false`
4. **Use managed secrets** - Consider AWS Secrets Manager, HashiCorp Vault, etc.
5. **Rotate secrets regularly** - Implement a rotation policy
6. **Monitor secret access** - Log and audit secret usage

## 🔄 Secret Rotation

When rotating secrets:

1. Generate new secret value
2. Update in Team Secrets (Cursor) or deployment platform
3. Update `.env` files on all environments
4. Restart all services
5. Verify functionality
6. Revoke old secret

## 🆘 Troubleshooting

### "Missing required environment variable"
- Check that `.env` file exists and is in the correct directory
- Verify the variable name matches exactly (case-sensitive)
- Ensure the value is not empty

### "Invalid secret format"
- Check for extra spaces or quotes in `.env` file
- Verify the secret format matches requirements (e.g., JWT format)

### "Permission denied accessing secrets"
- Verify file permissions on `.env` file
- Check that the application has read access to the file

## 📚 Additional Resources

- [Pydantic Settings Documentation](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [12-Factor App: Config](https://12factor.net/config)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

## 🔐 Secret Masking in Logs

The application automatically masks sensitive values in logs. If you need to debug configuration:

```python
from config import settings

# Safe - won't expose secrets
print(f"Database configured: {bool(settings.POSTGRES_DSN)}")
print(f"Stripe enabled: {bool(settings.STRIPE_SECRET_KEY)}")

# NEVER DO THIS - exposes secrets
# print(f"Stripe key: {settings.STRIPE_SECRET_KEY}")  # ❌ DANGEROUS
```

## 📞 Support

If you need help with secrets management:
1. Check this documentation first
2. Review `.env.example` for configuration templates
3. Contact the team lead for Team Secret access
4. Never share secrets in public channels
