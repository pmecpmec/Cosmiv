# AIDIT Security Implementation Guide

## Overview
This guide provides step-by-step instructions for implementing the security improvements identified in the security audit.

---

## Phase 1: Immediate Security Fixes (Required Before Production)

### 1.1 Environment Configuration

**Action:** Set up proper environment variables

```bash
# Copy the example file
cp backend/src/.env.example backend/src/.env

# Generate secure secrets
python3 << EOF
import secrets
print("JWT_SECRET_KEY=" + secrets.token_urlsafe(64))
print("S3_SECRET_KEY=" + secrets.token_urlsafe(32))
print("POSTGRES_PASSWORD=" + secrets.token_urlsafe(32))
EOF

# Add the generated values to .env
nano backend/src/.env
```

**Files Modified:**
- ✅ `backend/src/.env.example` - Template created
- ✅ `backend/src/config.py` - Updated with security validation
- ✅ `.gitignore` - Added to prevent .env from being committed

**Verification:**
```bash
# Ensure .env is not tracked
git status | grep -q ".env" && echo "WARNING: .env is tracked!" || echo "OK: .env is ignored"

# Test configuration loads
cd backend/src && python3 -c "from config import settings; print(f'Environment: {settings.ENVIRONMENT}')"
```

---

### 1.2 CORS Security

**Action:** Restrict CORS to specific origins and methods

**Files Modified:**
- ✅ `backend/src/main.py` - Updated CORS middleware with explicit allow lists

**Changes Made:**
- Replaced `allow_methods=["*"]` with explicit list
- Replaced `allow_headers=["*"]` with explicit list
- Added production validation to reject localhost origins
- Added security headers middleware

**Verification:**
```bash
# Start the backend
cd backend && docker-compose up -d

# Test CORS headers
curl -I http://localhost:8000/v2/jobs

# Should see:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

---

### 1.3 Security Dependencies

**Action:** Install security-related packages

**Files Modified:**
- ✅ `backend/src/requirements.txt` - Added security dependencies

**New Dependencies:**
- `python-jose[cryptography]` - JWT token handling
- `passlib[bcrypt]` - Password hashing
- `cryptography` - Token encryption
- `slowapi` - Rate limiting
- `httpx` - Secure HTTP client for external APIs

**Installation:**
```bash
cd backend/src
pip install -r requirements.txt

# Or rebuild Docker containers
cd .. && docker-compose build
```

---

### 1.4 Authentication System

**Action:** Implement JWT-based authentication

**Files Created:**
- ✅ `backend/src/security.py` - Core security utilities
- ✅ `backend/src/auth.py` - Authentication endpoints

**Key Features:**
- JWT token generation and verification
- Password hashing with bcrypt
- Security event logging
- Input sanitization helpers
- Path traversal protection

**Integration Steps:**

1. **Add authentication to main.py:**
```python
# In backend/src/main.py
from auth import router as auth_router

app.include_router(auth_router)
```

2. **Protect endpoints with authentication:**
```python
# Example: Protect job creation
from security import verify_token

@router.post("/jobs")
async def create_job_v2(
    user_id: str = Depends(verify_token),  # ← Add this
    files: List[UploadFile] = File(...),
    ...
):
    # Now user_id is authenticated
    # Store job with user_id for ownership verification
```

3. **Update User model to support authentication:**
```python
# In backend/src/models.py
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, unique=True)
    email: Optional[str] = Field(index=True, unique=True)
    password_hash: Optional[str] = None  # ← Add this
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## Phase 2: Input Validation & Sanitization

### 2.1 File Upload Security

**Action:** Add file validation to all upload endpoints

**Implementation:**
```python
# In api_v2.py
from security import sanitize_filename, validate_video_file

@router.post("/jobs")
async def create_job_v2(
    user_id: str = Depends(verify_token),
    files: List[UploadFile] = File(...),
    ...
):
    jid = new_job_id()
    uploads_dir = job_upload_dir(jid)
    
    for uf in files:
        # Validate file type
        validate_video_file(uf.filename, uf.content_type)
        
        # Sanitize filename
        safe_name = sanitize_filename(uf.filename)
        
        # Use sanitized name
        dst = os.path.join(uploads_dir, safe_name)
        with open(dst, "wb") as f:
            f.write(await uf.read())
```

**Apply to:**
- ✅ `api_v2.py` - Job uploads
- ✅ `api_styles_v2.py` - Style reference uploads
- ✅ `main.py` - Legacy upload endpoints

---

### 2.2 Path Traversal Protection

**Action:** Validate all file paths

**Implementation:**
```python
from security import validate_file_path

@router.get("/jobs/{job_id}/download")
def job_download_v2(
    job_id: str,
    user_id: str = Depends(verify_token),
    format: str = Query("landscape")
):
    export_dir = job_export_dir(job_id)
    local_path = os.path.join(export_dir, f"final_{format}.mp4")
    
    # Validate path is within export directory
    safe_path = validate_file_path(local_path, export_dir)
    
    if not os.path.exists(safe_path):
        raise HTTPException(404, "File not ready")
    
    return FileResponse(safe_path, ...)
```

---

### 2.3 FFmpeg Command Injection Prevention

**Action:** Sanitize text inputs used in FFmpeg commands

**Implementation:**
```python
# In tasks.py
from security import sanitize_ffmpeg_text

# When building FFmpeg commands with user input
watermark_text = sanitize_ffmpeg_text(settings.WATERMARK_TEXT)
vf_overlay = f"drawtext=text='{watermark_text}':..."
```

---

## Phase 3: Authorization & Access Control

### 3.1 Resource Ownership Verification

**Action:** Ensure users can only access their own resources

**Implementation:**

1. **Update Job model to include user_id:**
```python
# In models.py
class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(index=True)
    user_id: str = Field(index=True)  # ← Add this
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # ... rest of fields
```

2. **Store user_id when creating jobs:**
```python
@router.post("/jobs")
async def create_job_v2(
    user_id: str = Depends(verify_token),
    files: List[UploadFile] = File(...),
    ...
):
    with get_session() as session:
        job = Job(
            job_id=jid,
            user_id=user_id,  # ← Store owner
            status=JobStatus.PENDING,
            ...
        )
        session.add(job)
        session.commit()
```

3. **Verify ownership when accessing jobs:**
```python
from security import validate_user_owns_resource

@router.get("/jobs/{job_id}/status")
def job_status_v2(
    job_id: str,
    user_id: str = Depends(verify_token)
):
    with get_session() as session:
        job = session.exec(select(Job).where(Job.job_id == job_id)).first()
        if not job:
            raise HTTPException(404, "Job not found")
        
        # Verify ownership
        validate_user_owns_resource(user_id, job.user_id)
        
        return {"job_id": job.job_id, "status": job.status}
```

---

### 3.2 Admin-Only Endpoints

**Action:** Protect admin endpoints with role-based access

**Implementation:**
```python
# In security.py
async def verify_admin(user_id: str = Depends(verify_token)) -> str:
    """Verify user has admin role"""
    with get_session() as session:
        user = session.exec(select(User).where(User.user_id == user_id)).first()
        if not user or not user.is_admin:
            log_security_event(
                "UNAUTHORIZED_ADMIN_ACCESS",
                user_id,
                {}
            )
            raise HTTPException(403, "Admin access required")
    return user_id

# In api_billing_v2.py
@router.post("/entitlements")
def set_entitlement(
    admin_id: str = Depends(verify_admin),  # ← Require admin
    user_id: str = Form(...),
    plan: str = Form("pro")
):
    log_security_event("ENTITLEMENT_CHANGE", admin_id, 
                      {"target_user": user_id, "plan": plan})
    # ... rest of logic
```

---

## Phase 4: Rate Limiting

### 4.1 Install and Configure Rate Limiting

**Action:** Add rate limiting to prevent abuse

**Implementation:**
```python
# In main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Apply to endpoints
@router.post("/jobs")
@limiter.limit("10/minute")  # 10 jobs per minute per IP
async def create_job_v2(
    request: Request,  # ← Required for rate limiting
    user_id: str = Depends(verify_token),
    ...
):
    ...

@router.post("/auth/login")
@limiter.limit("5/minute")  # Prevent brute force
async def login(request: Request, credentials: UserLogin):
    ...
```

**Recommended Limits:**
- Authentication: 5 requests/minute
- Job creation: 10 requests/minute
- File uploads: 20 requests/hour
- Account operations: 10 requests/minute

---

## Phase 5: Error Handling & Logging

### 5.1 Secure Error Handling

**Action:** Prevent information disclosure through errors

**Implementation:**
```python
# In main.py
import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log full error internally
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    # Return generic error to client
    if settings.ENVIRONMENT == "development":
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error", "detail": str(exc)}
        )
    else:
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"}
        )
```

---

### 5.2 Security Event Logging

**Action:** Log all security-relevant events

**Implementation:**
```python
# Configure security logger
import logging
from logging.handlers import RotatingFileHandler

security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)

handler = RotatingFileHandler(
    "/var/log/aidit/security.log",
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5
)
handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(levelname)s - %(message)s'
))
security_logger.addHandler(handler)
```

**Events to Log:**
- Authentication attempts (success/failure)
- Account linking/unlinking
- Entitlement changes
- Unauthorized access attempts
- File uploads
- Job creation/deletion
- Admin actions

---

## Phase 6: External Integration Security

### 6.1 Webhook Verification

**Action:** Verify signatures on incoming webhooks

**Implementation:**
```python
import hmac
import hashlib
from fastapi import Request, Header, HTTPException

@router.post("/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature")
):
    if not stripe_signature:
        raise HTTPException(401, "Missing signature")
    
    body = await request.body()
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    # Verify signature
    expected = hmac.new(
        webhook_secret.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(expected, stripe_signature):
        log_security_event("WEBHOOK_VERIFICATION_FAILED", None, 
                          {"source": "stripe"})
        raise HTTPException(401, "Invalid signature")
    
    # Process webhook
    data = await request.json()
    # ... handle event
    
    return {"status": "received"}
```

---

### 6.2 External API Client

**Action:** Create secure client for external APIs

**Implementation:**
```python
# In services/external_api.py
import httpx
from typing import Optional
import os

class ExternalAPIClient:
    def __init__(self, service_name: str):
        self.api_key = os.getenv(f"{service_name.upper()}_API_KEY")
        self.api_secret = os.getenv(f"{service_name.upper()}_API_SECRET")
        self.base_url = os.getenv(f"{service_name.upper()}_API_URL")
        self.timeout = 30
        
        if not all([self.api_key, self.base_url]):
            raise ValueError(f"{service_name} API not configured")
    
    async def make_request(self, endpoint: str, data: dict) -> dict:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "AIDIT/1.0"
            }
            
            try:
                response = await client.post(
                    f"{self.base_url}/{endpoint}",
                    json=data,
                    headers=headers
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"External API error: {e}")
                raise HTTPException(502, "External service unavailable")
```

---

## Phase 7: Frontend Security

### 7.1 Add Security Headers to HTML

**Action:** Add Content Security Policy

**Implementation:**
```html
<!-- In index.html -->
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;">
  <title>AIDIT</title>
</head>
```

---

### 7.2 Add Authentication to Frontend

**Action:** Implement token storage and API calls

**Implementation:**
```javascript
// In src/utils/auth.js
export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// In src/utils/api.js
export const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    clearAuthToken();
    window.location.href = '/login';
  }
  
  return response;
};
```

---

## Phase 8: Testing & Validation

### 8.1 Security Test Suite

**Action:** Create automated security tests

**Implementation:**
```python
# tests/security/test_auth.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_unauthenticated_access_denied():
    """Verify endpoints require authentication"""
    response = client.get("/v2/jobs")
    assert response.status_code == 401

def test_invalid_token_rejected():
    """Verify invalid tokens are rejected"""
    response = client.get(
        "/v2/jobs",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401

def test_path_traversal_blocked():
    """Verify path traversal is prevented"""
    files = {"files": ("../../../etc/passwd", b"content", "video/mp4")}
    response = client.post("/v2/jobs", files=files)
    assert response.status_code in [400, 401]

def test_cors_headers_present():
    """Verify security headers are set"""
    response = client.get("/")
    assert "X-Content-Type-Options" in response.headers
    assert response.headers["X-Content-Type-Options"] == "nosniff"
```

---

### 8.2 Manual Security Checklist

**Before Production Deployment:**

- [ ] All secrets moved to environment variables
- [ ] `.env` file is in `.gitignore`
- [ ] JWT_SECRET_KEY is set to secure random value
- [ ] S3/Database credentials changed from defaults
- [ ] CORS origins configured for production domain
- [ ] HTTPS enforced in production
- [ ] Rate limiting enabled on all endpoints
- [ ] Authentication required on all sensitive endpoints
- [ ] Resource ownership verified on all access
- [ ] Error messages don't expose internal details
- [ ] Security event logging enabled
- [ ] Webhook signatures verified
- [ ] File uploads validated and sanitized
- [ ] Path traversal protection in place
- [ ] Security headers configured
- [ ] Dependencies updated and scanned
- [ ] Security tests passing

---

## Phase 9: Monitoring & Maintenance

### 9.1 Security Monitoring

**Action:** Set up monitoring for security events

**Tools:**
- Log aggregation (ELK Stack, Splunk, or CloudWatch)
- Intrusion detection (Fail2Ban for rate limit violations)
- Dependency scanning (Dependabot, Snyk)

**Alerts to Configure:**
- Multiple failed authentication attempts
- Webhook verification failures
- Path traversal attempts
- Rate limit violations
- Unauthorized access attempts

---

### 9.2 Regular Security Audits

**Schedule:**
- Weekly: Dependency vulnerability scans
- Monthly: Review security logs
- Quarterly: Penetration testing
- Annually: Full security audit

**Commands:**
```bash
# Scan dependencies for vulnerabilities
pip install safety
safety check

# Scan code for security issues
pip install bandit
bandit -r backend/src/

# Run security tests
pytest tests/security/
```

---

## Quick Reference

### Environment Variables Checklist

```bash
# Required for production:
ENVIRONMENT=production
JWT_SECRET_KEY=<64-char-random>
S3_SECRET_KEY=<32-char-random>
POSTGRES_DSN=postgresql+psycopg://user:SECURE_PASSWORD@host/db
ENCRYPTION_KEY=<fernet-key>
ALLOWED_ORIGINS=https://yourdomain.com
ALLOWED_HOSTS=yourdomain.com

# Optional (for integrations):
STRIPE_SECRET_KEY=<stripe-key>
STRIPE_WEBHOOK_SECRET=<webhook-secret>
GOPLUS_API_KEY=<goplus-key>
QUICKINTEL_API_KEY=<quickintel-key>
```

### Common Security Patterns

**Protect an endpoint:**
```python
from security import verify_token

@router.post("/endpoint")
async def endpoint(user_id: str = Depends(verify_token)):
    # user_id is now authenticated
    pass
```

**Verify resource ownership:**
```python
from security import validate_user_owns_resource

validate_user_owns_resource(user_id, resource.user_id)
```

**Sanitize filename:**
```python
from security import sanitize_filename

safe_name = sanitize_filename(upload.filename)
```

**Log security event:**
```python
from security import log_security_event

log_security_event("EVENT_TYPE", user_id, {"key": "value"})
```

---

## Support & Questions

For questions about security implementation:
1. Review the Security Audit Report (`SECURITY_AUDIT_REPORT.md`)
2. Check this implementation guide
3. Review code in `backend/src/security.py` and `backend/src/auth.py`
4. Consult OWASP guidelines: https://owasp.org/

**Remember:** Security is not a one-time task. Continuously monitor, update, and improve security measures.
