# Backend Tests

This directory contains tests for the Cosmiv backend API.

## Test Structure

```
backend/tests/
├── conftest.py              # Pytest fixtures and configuration
├── test_auth.py            # Authentication tests (NEW)
├── test_api_endpoints.py   # API endpoint tests (NEW)
├── test_tasks.py           # Celery task tests (existing)
├── test_highlight_detection.py  # Highlight detection tests (existing)
├── test_upload_clips_api.py     # Upload API tests (existing)
└── test_manual_upload_api.py    # Manual upload tests (existing)
```

## Running Tests

### Local Development (Docker)

```bash
cd backend
docker-compose exec backend pytest tests/ -v
```

### CI/CD

Tests run automatically on push/PR via `.github/workflows/ci.yml`

### Individual Test Files

```bash
# Run all auth tests
pytest tests/test_auth.py -v

# Run all API endpoint tests
pytest tests/test_api_endpoints.py -v

# Run with coverage
pytest tests/ --cov=src --cov-report=term
```

## Test Coverage

### Authentication Tests (`test_auth.py`)

- ✅ Password hashing and verification
- ✅ User registration (success, duplicates, invalid email)
- ✅ User login (success, wrong password, nonexistent user)
- ✅ JWT token generation and validation
- ✅ Protected endpoint access
- ✅ Password hash storage in database

### API Endpoint Tests (`test_api_endpoints.py`)

- ✅ Health check endpoint
- ✅ Accounts API (providers, links, authentication requirements)
- ✅ Billing API (plans, entitlements, authentication requirements)
- ✅ Jobs API (authentication requirements)
- ✅ Admin API (authentication and authorization)

### Existing Tests

- Task processing tests (`test_tasks.py`)
- Highlight detection tests (`test_highlight_detection.py`)
- Upload API tests (`test_upload_clips_api.py`, `test_manual_upload_api.py`)

## Test Configuration

- **Database**: In-memory SQLite (configured in `conftest.py`)
- **Configuration**: `backend/pytest.ini`
- **Coverage**: Configured for CI/CD reporting

## Writing New Tests

1. Create test file: `test_*.py`
2. Use fixtures from `conftest.py`:
   - `client`: FastAPI TestClient
   - `test_user`: Pre-registered user with token
   - `authenticated_user`: User with auth headers
3. Follow naming: `test_<feature>_<scenario>()`
4. Use pytest markers: `@pytest.mark.unit`, `@pytest.mark.integration`

## Example Test

```python
def test_endpoint_requires_auth(client):
    """Test endpoint requires authentication"""
    response = client.get("/api/v2/jobs")
    assert response.status_code in [401, 403]
```

## Coverage Goals

- Current: Basic coverage for auth and API endpoints
- Target: 70%+ coverage for critical paths
- Focus areas: Authentication, job processing, file uploads

---

**Last Updated**: 2025-01-27

