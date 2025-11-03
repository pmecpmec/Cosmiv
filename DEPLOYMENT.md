# 🚀 Production Deployment Guide

Complete guide for deploying Cosmiv to production.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Storage Setup](#storage-setup)
- [Environment Variables](#environment-variables)
- [CI/CD](#cicd)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Docker & Docker Compose installed
- Domain name configured
- SSL certificates (Let's Encrypt recommended)
- PostgreSQL database (managed or self-hosted)
- Redis instance (managed or self-hosted)
- S3-compatible storage (AWS S3, Cloudflare R2, etc.)
- Stripe account with API keys

---

## Backend Deployment

### Option 1: Docker Compose (Recommended for VPS)

1. **Clone repository:**

   ```bash
   git clone https://github.com/yourusername/aiditor.git
   cd aiditor/backend
   ```

2. **Copy environment template:**

   ```bash
   cp ../.env.production.template .env.prod
   ```

3. **Edit `.env.prod` with your production values**

4. **Build and start:**

   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
   ```

5. **Initialize database:**

   ```bash
   docker-compose -f docker-compose.prod.yml exec backend python -c "from db import init_db; init_db()"
   ```

6. **Verify health:**
   ```bash
   curl http://localhost:8000/health
   ```

### Option 2: Cloud Provider (AWS, GCP, Azure)

#### AWS (ECS/EKS)

1. **Build and push image:**

   ```bash
   docker build -f backend/src/Dockerfile.prod -t aiditor-backend .
   docker tag aiditor-backend:latest YOUR_ECR_URI/aiditor-backend:latest
   docker push YOUR_ECR_URI/aiditor-backend:latest
   ```

2. **Create ECS task definition** with environment variables

3. **Deploy to ECS service** with desired task count

#### Google Cloud Run

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT/aiditor-backend
gcloud run deploy aiditor-backend \
  --image gcr.io/YOUR_PROJECT/aiditor-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure Container Instances

```bash
az acr build --registry YOUR_REGISTRY --image aiditor-backend:latest backend/src
az container create \
  --resource-group YOUR_RESOURCE_GROUP \
  --name aiditor-backend \
  --image YOUR_REGISTRY.azurecr.io/aiditor-backend:latest \
  --cpu 2 --memory 4
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Login:**

   ```bash
   vercel login
   ```

3. **Deploy:**

   ```bash
   vercel --prod
   ```

4. **Set environment variables in Vercel dashboard:**

   - `VITE_API_URL`: Your backend API URL

5. **Configure custom domain** in Vercel dashboard

### Option 2: Netlify

1. **Install Netlify CLI:**

   ```bash
   npm i -g netlify-cli
   ```

2. **Login:**

   ```bash
   netlify login
   ```

3. **Deploy:**

   ```bash
   netlify deploy --prod
   ```

4. **Set environment variables in Netlify dashboard**

### Option 3: Static Hosting (Cloudflare Pages, AWS S3, etc.)

1. **Build frontend:**

   ```bash
   npm run build
   ```

2. **Upload `dist/` folder** to your hosting service

3. **Configure API proxy** to backend

---

## Database Setup

### PostgreSQL (Production)

1. **Create database:**

   ```sql
   CREATE DATABASE aiditor;
   CREATE USER aiditor_user WITH PASSWORD '<strong-password>';
   GRANT ALL PRIVILEGES ON DATABASE aiditor TO aiditor_user;
   ```

2. **Set connection string:**
   ```
   POSTGRES_DSN=postgresql+psycopg://user:password@host:5432/database
   ```

### Managed Databases (Recommended)

- **AWS RDS**: Managed PostgreSQL with automatic backups
- **Google Cloud SQL**: Fully managed database
- **Azure Database**: Managed PostgreSQL service
- **Supabase**: Open-source Firebase alternative
- **Neon**: Serverless PostgreSQL

---

## Storage Setup

### AWS S3

1. **Create bucket:**

   ```bash
   aws s3 mb s3://aiditor-prod
   ```

2. **Set CORS policy:**

   ```json
   {
     "CORSRules": [
       {
         "AllowedOrigins": ["https://yourdomain.com"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
         "AllowedHeaders": ["*"]
       }
     ]
   }
   ```

3. **Configure environment:**
   ```
   S3_ENDPOINT_URL=https://s3.amazonaws.com
   S3_REGION=us-east-1
   S3_ACCESS_KEY=YOUR_ACCESS_KEY
   S3_SECRET_KEY=YOUR_SECRET_KEY
   S3_BUCKET=aiditor-prod
   ```

### Cloudflare R2

1. **Create R2 bucket** in Cloudflare dashboard

2. **Generate API tokens**

3. **Configure environment:**
   ```
   S3_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
   S3_ACCESS_KEY=YOUR_ACCESS_KEY
   S3_SECRET_KEY=YOUR_SECRET_KEY
   S3_BUCKET=aiditor-prod
   ```

---

## Environment Variables

### Backend (.env.prod)

See `.env.production.template` for complete list.

**Required:**

- `POSTGRES_DSN`: PostgreSQL connection string
- `REDIS_URL`: Redis connection URL
- `JWT_SECRET_KEY`: Strong secret for JWT signing
- `STRIPE_SECRET_KEY`: Stripe secret key
- `BASE_URL`: Your production domain

**Optional:**

- `USE_POSTGRES`: Use PostgreSQL (default: false, SQLite)
- `USE_OBJECT_STORAGE`: Use S3 storage (default: false, local)
- `LOG_LEVEL`: Logging level (INFO, DEBUG, WARNING, ERROR)

### Frontend (Vercel/Netlify)

- `VITE_API_URL`: Backend API URL (e.g., `https://api.yourdomain.com`)

---

## CI/CD

### GitHub Actions

The repository includes GitHub Actions workflows (`.github/workflows/ci.yml`) that:

1. **Run tests** on push/PR
2. **Lint code** (black, flake8, mypy)
3. **Build Docker images** on main branch
4. **Deploy** to production (configure in Actions secrets)

### Setup

1. **Add secrets** in GitHub Settings → Secrets:

   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`
   - Production deployment credentials

2. **Configure environment** in GitHub Actions:

   - Set `production` environment with protection rules

3. **Enable workflows** in repository settings

---

## Monitoring

### Health Checks

Backend includes `/health` endpoint:

```bash
curl https://api.yourdomain.com/health
```

Response:

```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "storage": "available"
}
```

### Logging

- **Development**: Console logs
- **Production**: Structured JSON logs
- **Recommended**: Send logs to:
  - CloudWatch (AWS)
  - Cloud Logging (GCP)
  - Azure Monitor (Azure)
  - Datadog / Sentry

### Metrics

Monitor:

- API response times
- Job queue length
- Worker utilization
- Database connection pool
- Storage usage

---

## Troubleshooting

### Backend won't start

1. **Check logs:**

   ```bash
   docker-compose -f docker-compose.prod.yml logs backend
   ```

2. **Verify environment variables:**

   ```bash
   docker-compose -f docker-compose.prod.yml config
   ```

3. **Test database connection:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend python -c "from db import get_session; print('DB OK')"
   ```

### Frontend can't connect to backend

1. **Check CORS settings** in `backend/src/main.py`

2. **Verify API URL** in frontend environment variables

3. **Test API endpoint:**
   ```bash
   curl https://api.yourdomain.com/health
   ```

### Jobs not processing

1. **Check Celery worker:**

   ```bash
   docker-compose -f docker-compose.prod.yml logs worker
   ```

2. **Verify Redis connection:**

   ```bash
   docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
   ```

3. **Check worker status:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec worker celery -A tasks.celery_app inspect active
   ```

---

## Security Checklist

- [ ] Strong `JWT_SECRET_KEY` (min 32 characters, random)
- [ ] PostgreSQL password is secure
- [ ] S3 credentials are scoped properly
- [ ] Stripe webhook secret is set
- [ ] CORS is configured for your domain only
- [ ] SSL/TLS certificates are valid
- [ ] Database backups are enabled
- [ ] Rate limiting is configured
- [ ] API keys are not in version control
- [ ] Environment variables are encrypted

---

## Scaling

### Horizontal Scaling

- **Backend**: Run multiple FastAPI instances behind load balancer
- **Workers**: Increase Celery worker replicas
- **Database**: Use read replicas for queries
- **Redis**: Use Redis Cluster for high availability

### Vertical Scaling

- Increase CPU/memory for workers (video processing is CPU-intensive)
- Use GPU instances for AI model inference (if enabled)

---

## Backup Strategy

1. **Database**: Daily automated backups

   - PostgreSQL: Use `pg_dump` or managed backups
   - Store backups in separate S3 bucket

2. **Storage**: S3 versioning enabled

   - Lifecycle policies for old versions

3. **Configuration**: Store `.env.prod` securely
   - Use secrets management (AWS Secrets Manager, etc.)

---

**Need Help?** Open an issue or contact support.
