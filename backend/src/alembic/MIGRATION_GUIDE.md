# Database Migration Guide

This guide explains how to use Alembic for database migrations in Cosmiv.

## Setup

Alembic is already configured. To use it:

1. **Install Alembic** (if not already installed):
   ```bash
   pip install alembic
   ```

2. **Verify configuration**:
   ```bash
   cd backend/src
   alembic current
   ```

## Creating Migrations

### Auto-generate Migration (Recommended)

Alembic can automatically detect model changes:

```bash
cd backend/src
alembic revision --autogenerate -m "description of changes"
```

This will:
- Compare current models with database schema
- Generate migration script in `alembic/versions/`
- Review the generated script before applying

### Manual Migration

For complex changes or data migrations:

```bash
alembic revision -m "description of changes"
```

Then edit the generated file in `alembic/versions/` to add your migration logic.

## Applying Migrations

### Apply All Pending Migrations

```bash
alembic upgrade head
```

### Apply One Migration at a Time

```bash
alembic upgrade +1
```

### Rollback

```bash
# Rollback one migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade <revision_id>

# Rollback all migrations
alembic downgrade base
```

## Checking Status

### Current Database Revision

```bash
alembic current
```

### Migration History

```bash
alembic history
```

### Show Pending Migrations

```bash
alembic heads
```

## Production Deployment

### Before Deployment

1. **Backup database**:
   ```bash
   pg_dump -h localhost -U postgres cosmiv > backup_$(date +%Y%m%d).sql
   ```

2. **Test migrations on staging**:
   ```bash
   alembic upgrade head
   ```

### During Deployment

Add to your deployment script:

```bash
# Run migrations
alembic upgrade head

# Verify
alembic current
```

### CI/CD Integration

Add to `.github/workflows/ci.yml`:

```yaml
- name: Run migrations
  run: |
    alembic upgrade head
```

## Common Tasks

### Initial Migration (First Time Setup)

```bash
# Create initial migration from existing models
alembic revision --autogenerate -m "Initial schema"

# Review the generated file, then apply
alembic upgrade head
```

### Adding a New Model

1. Add model to `models.py` or `models_ai.py`
2. Import in `alembic/env.py` (already done)
3. Generate migration:
   ```bash
   alembic revision --autogenerate -m "Add FrontendPattern model"
   ```
4. Review and apply:
   ```bash
   alembic upgrade head
   ```

### Modifying Existing Model

1. Update model definition
2. Generate migration:
   ```bash
   alembic revision --autogenerate -m "Add password_hash to User"
   ```
3. Review generated migration
4. Apply:
   ```bash
   alembic upgrade head
   ```

## Troubleshooting

### Migration Conflicts

If you have multiple heads (branched migrations):

```bash
# Merge branches
alembic merge heads -m "Merge migration branches"
```

### Database Out of Sync

If database doesn't match models:

```bash
# Check current state
alembic current

# See what migrations are pending
alembic heads

# Apply pending migrations
alembic upgrade head
```

### Reset Everything (Development Only!)

⚠️ **WARNING: This deletes all data!**

```bash
# Drop all tables
alembic downgrade base

# Recreate from scratch
alembic upgrade head
```

## Best Practices

1. **Always review auto-generated migrations** before applying
2. **Test migrations on staging** before production
3. **Backup database** before major migrations
4. **Use descriptive migration messages**
5. **One logical change per migration** when possible
6. **Never edit applied migrations** - create new ones instead

## Environment Variables

Alembic uses the same database connection as the app:

- `POSTGRES_DSN` - PostgreSQL connection string
- `USE_POSTGRES` - Whether to use PostgreSQL
- `DB_PATH` - SQLite path (if not using PostgreSQL)

These are read from `config.py` automatically.

