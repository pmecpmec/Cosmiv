# Cosmiv API Reference

Complete API documentation for Cosmiv backend.

## Base URL

- **Development:** `http://localhost:8000`
- **Production:** `https://api.cosmiv.com`

## Authentication

Most endpoints require authentication via JWT Bearer token.

```http
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user_id": "user_123"
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "data": {
      "field": "additional context"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `AUTHENTICATION_REQUIRED` - Missing or invalid token
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

---

## Jobs API

### Create Job

Create a new video processing job.

```http
POST /api/v2/jobs
Content-Type: multipart/form-data
Authorization: Bearer <token>

files: <file1>, <file2>, ...
target_duration: 60
style: cinematic
formats: landscape,portrait
hud_remove: false
watermark: true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": "abc123",
    "status": "PENDING",
    "created_at": "2025-01-28T10:00:00Z"
  }
}
```

### Get Job Status

```http
GET /api/v2/jobs/{job_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": "abc123",
    "status": "PROCESSING",
    "stage": "rendering",
    "progress": {
      "percent": 75,
      "stage": "rendering"
    },
    "created_at": "2025-01-28T10:00:00Z",
    "started_at": "2025-01-28T10:01:00Z"
  }
}
```

### List Jobs

```http
GET /api/v2/jobs?limit=10&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "job_id": "abc123",
        "status": "SUCCESS",
        "created_at": "2025-01-28T10:00:00Z"
      }
    ],
    "total": 42
  }
}
```

### Download Job Result

```http
GET /api/v2/jobs/{job_id}/download?format=landscape
Authorization: Bearer <token>
```

**Response:**
- Redirects to download URL or returns file directly

---

## Authentication API

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/x-www-form-urlencoded

refresh_token=<refresh_token>
```

---

## Accounts API

### List Providers

Get available gaming platform providers.

```http
GET /api/v2/accounts/providers
```

**Response:**
```json
{
  "providers": [
    {
      "id": "steam",
      "name": "Steam",
      "icon": "🎮",
      "description": "Steam Library"
    }
  ]
}
```

### Start OAuth Flow

```http
GET /api/v2/accounts/oauth/{provider}
Authorization: Bearer <token>
```

Redirects to platform OAuth page.

### List Linked Accounts

```http
GET /api/v2/accounts/links
Authorization: Bearer <token>
```

### Sync Clips

```http
POST /api/v2/accounts/sync
Authorization: Bearer <token>
```

Triggers background sync of clips from linked platforms.

---

## Billing API

### List Plans

```http
GET /api/v2/billing/plans
```

**Response:**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Cosmic Cadet",
      "price": 0,
      "features": ["60s limit", "Watermark"]
    },
    {
      "id": "pro",
      "name": "Nebula Knight",
      "price": 9,
      "features": ["120s limit", "No watermark"]
    }
  ]
}
```

### Create Checkout

```http
POST /api/v2/billing/checkout
Content-Type: application/x-www-form-urlencoded
Authorization: Bearer <token>

plan=pro
```

**Response:**
```json
{
  "checkout_url": "https://checkout.stripe.com/..."
}
```

### Get Subscription

```http
GET /api/v2/billing/subscription
Authorization: Bearer <token>
```

---

## Styles API

### List Styles

```http
GET /api/v2/styles
```

**Response:**
```json
{
  "presets": ["cinematic", "gaming", "energetic", "chill"]
}
```

### Get Style Details

```http
GET /api/v2/styles/{style_id}
```

---

## Analytics API

### Get User Stats

```http
GET /api/v2/analytics/user/stats
Authorization: Bearer <token>
```

### Track View

```http
POST /api/v2/analytics/track-view/{job_id}
Authorization: Bearer <token>
```

---

## Social API

### List Connections

```http
GET /api/v2/social/connections
Authorization: Bearer <token>
```

### Create Post

```http
POST /api/v2/social/posts
Content-Type: application/json
Authorization: Bearer <token>

{
  "platform": "tiktok",
  "job_id": "abc123",
  "caption": "Check out my montage!"
}
```

---

## Weekly Montages API

### List Montages

```http
GET /api/v2/weekly-montages?limit=10&featured_only=true
```

### Get Montage

```http
GET /api/v2/weekly-montages/{montage_id}
```

---

## Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "storage": "accessible",
  "celery": "connected"
}
```

---

## Rate Limiting

- **Authentication endpoints:** 10 requests/minute
- **Upload endpoints:** 5 requests/minute
- **General API:** 100 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Request IDs

All responses include a `X-Request-ID` header for request tracking.

---

## Pagination

List endpoints support pagination:

```
GET /api/v2/jobs?limit=20&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## Webhooks

### Stripe Webhook

```http
POST /api/v2/billing/webhook
Stripe-Signature: <signature>

{
  "type": "checkout.session.completed",
  "data": {...}
}
```

---

## Examples

### Complete Job Flow

```javascript
// 1. Create job
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('target_duration', '60');
formData.append('style', 'cinematic');

const job = await fetch('/api/v2/jobs', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
}).then(r => r.json());

// 2. Poll for status
const pollStatus = async (jobId) => {
  const status = await fetch(`/api/v2/jobs/${jobId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  if (status.data.status === 'SUCCESS') {
    return status.data;
  }
  
  if (status.data.status === 'FAILED') {
    throw new Error('Job failed');
  }
  
  // Wait and retry
  await new Promise(r => setTimeout(r, 2000));
  return pollStatus(jobId);
};

// 3. Download result
const result = await pollStatus(job.data.job_id);
window.location.href = `/api/v2/jobs/${job.data.job_id}/download?format=landscape`;
```

---

## SDK Examples

### Python

```python
import requests

BASE_URL = "https://api.cosmiv.com"
token = "your_jwt_token"

headers = {"Authorization": f"Bearer {token}"}

# Create job
files = {"files": open("clip.mp4", "rb")}
data = {"target_duration": 60, "style": "cinematic"}
response = requests.post(f"{BASE_URL}/api/v2/jobs", files=files, data=data, headers=headers)
job = response.json()

# Check status
job_id = job["data"]["job_id"]
status = requests.get(f"{BASE_URL}/api/v2/jobs/{job_id}", headers=headers).json()
```

### JavaScript/TypeScript

```typescript
import api from './utils/apiClient';

// Create job
const formData = new FormData();
formData.append('files', file);
formData.append('target_duration', '60');

const job = await api.post('/api/v2/jobs', formData, { requireAuth: true });

// Poll status
const checkStatus = async (jobId: string) => {
  const status = await api.get(`/api/v2/jobs/${jobId}`, { requireAuth: true });
  return status.data;
};
```

---

## Support

For API support, contact: api-support@cosmiv.com

