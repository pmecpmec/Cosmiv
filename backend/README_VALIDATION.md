# Secrets Validation Script

## Overview

The `validate_secrets.py` script validates that all required environment variables are properly configured before deployment.

## Usage

### Basic Validation
```bash
cd backend
python validate_secrets.py
```

### Prerequisites
Ensure dependencies are installed:
```bash
pip install -r src/requirements.txt
```

### In Docker
```bash
docker-compose run backend python /app/validate_secrets.py
```

## What It Checks

### Required Secrets (Production)
- `JWT_SECRET_KEY` - Authentication
- `SESSION_SECRET` - Session management
- `STRIPE_SECRET_KEY` - Billing (if enabled)
- `POSTGRES_DSN` - Database (if USE_POSTGRES=true)
- `S3_SECRET_KEY` - Storage (if USE_OBJECT_STORAGE=true)

### Optional Secrets
- Gaming APIs (Steam, Xbox, PlayStation, Nintendo)
- AI/ML Services (OpenAI)
- Email (SMTP)
- Monitoring (Sentry, Analytics)

### Security Checks
- Detects default/insecure values
- Warns about missing optional features
- Validates based on feature flags

## Output

The script provides:
- ✅ Green checkmarks for configured secrets
- ⚠️  Yellow warnings for missing optional secrets
- ❌ Red errors for missing required secrets
- Masked secret values (never shows raw secrets)

## Exit Codes

- `0` - Validation passed
- `1` - Validation failed (missing required secrets)

## CI/CD Integration

Add to your CI/CD pipeline:
```yaml
- name: Validate Secrets
  run: |
    cd backend
    python validate_secrets.py
```

## Examples

### Success
```
============================================================
                  AIDIT Secrets Validation                  
============================================================

ℹ️  Environment: Production
ℹ️  PostgreSQL: Enabled
ℹ️  Object Storage: Enabled

============================================================
                    Required Secrets                        
============================================================

✅ All required secrets are configured

============================================================
                   Validation Result                        
============================================================

✅ VALIDATION PASSED

All secrets are properly configured!
```

### Failure
```
============================================================
                  AIDIT Secrets Validation                  
============================================================

============================================================
                    Required Secrets                        
============================================================

❌ Missing required secrets:
  • JWT_SECRET_KEY - Required for authentication
  • SESSION_SECRET - Required for session management

============================================================
                   Validation Result                        
============================================================

❌ VALIDATION FAILED

Cannot proceed with missing required secrets.
Please configure the missing secrets and try again.
```

## Security

The validation script:
- Never displays raw secret values
- Masks all sensitive output
- Uses safe string operations
- Provides actionable error messages

## Troubleshooting

### "ModuleNotFoundError: No module named 'pydantic_settings'"
Install dependencies:
```bash
pip install -r src/requirements.txt
```

### "Cannot import config"
Ensure you're running from the `backend` directory:
```bash
cd backend
python validate_secrets.py
```

### "All secrets show as not configured"
Check that `.env` file exists:
```bash
ls -la .env
```

If missing, create from template:
```bash
cp .env.example .env
# Edit .env with your values
```
