# Alembic Migrations

This directory contains database migration scripts.

## Migration Naming Convention

- Use descriptive names: `001_add_account_lockout_fields.py`
- Include revision ID in filename
- Start with sequential number for easy ordering

## Creating Migrations

### Auto-generate (Recommended)

```bash
cd backend/src
alembic revision --autogenerate -m "description of changes"
```

### Manual Migration

```bash
cd backend/src
alembic revision -m "description of changes"
```

Then edit the generated file in `versions/` directory.

## Applying Migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Apply one migration
alembic upgrade +1

# Rollback one migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade <revision_id>
```

## Current Migrations

- `001_add_account_lockout_fields.py` - Adds `failed_login_attempts` and `account_locked_until` to User table

