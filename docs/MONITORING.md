# Monitoring & Observability Guide

This guide explains how to set up and use monitoring, error tracking, and logging in Cosmiv.

---

## Error Tracking (Sentry)

### Setup

1. **Create a Sentry account** at https://sentry.io
2. **Create a new project** and get your DSN
3. **Set environment variables:**

```bash
SENTRY_ENABLED=true
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions
RELEASE_VERSION=v1.0.0  # Optional: track releases
```

### Features

- **Automatic error capture** - All unhandled exceptions are sent to Sentry
- **Performance monitoring** - Transaction tracing (10% sample rate)
- **Integration support:**
  - FastAPI integration (captures HTTP errors)
  - SQLAlchemy integration (captures DB errors)
  - Celery integration (captures task errors)

### Viewing Errors

1. Go to your Sentry dashboard
2. Errors appear in real-time
3. Each error includes:
   - Stack trace
   - Request context
   - User information (if available)
   - Environment and release version

### Best Practices

- Set `SENTRY_ENABLED=false` in development
- Use different projects for staging/production
- Set appropriate sample rates to control costs
- Review and resolve errors regularly

---

## Structured Logging

### Configuration

Logging is automatically configured based on `ENVIRONMENT`:

- **Development:** Human-readable structured format
- **Production:** JSON format for log aggregation

### Log Levels

Set via `LOG_LEVEL` environment variable:
- `DEBUG` - Detailed information for debugging
- `INFO` - General informational messages
- `WARNING` - Warning messages
- `ERROR` - Error messages
- `CRITICAL` - Critical errors

### Log Format

#### Development Format
```
[2025-01-28 10:00:00] [INFO    ] [main] [req=abc12345] [user=user123] [job=job456] Message here
```

#### Production Format (JSON)
```json
{
  "timestamp": "2025-01-28T10:00:00.000000",
  "level": "INFO",
  "logger": "main",
  "message": "Message here",
  "module": "main",
  "function": "some_function",
  "line": 123,
  "request_id": "abc12345",
  "user_id": "user123",
  "job_id": "job456"
}
```

### Request ID Tracking

Every HTTP request gets a unique `X-Request-ID` header:

1. **Request ID is generated** for each incoming request
2. **Added to response headers** as `X-Request-ID`
3. **Included in all logs** for that request
4. **Useful for tracing** requests across services

### Using Loggers

```python
import logging

logger = logging.getLogger(__name__)

# Basic logging
logger.info("User logged in")
logger.error("Failed to process payment", exc_info=True)

# With context (request ID, user ID, etc.)
# Context is automatically added by middleware
logger.info("Processing job", extra={"job_id": "job123"})
```

### Log Aggregation

For production, use a log aggregation service:

- **CloudWatch** (AWS)
- **Datadog**
- **Loggly**
- **Elasticsearch + Kibana**
- **Loki** (Grafana)

All logs are JSON-formatted in production, making them easy to parse and search.

---

## Health Checks

### Endpoint

`GET /health`

### Response

```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "storage": "accessible",
  "celery": "connected"
}
```

### Monitoring

Set up health check monitoring:

1. **Uptime monitoring** - Ping `/health` every 60 seconds
2. **Alert on failures** - Notify when status != "healthy"
3. **Track response time** - Monitor for performance degradation

### Services Checked

- **Database** - PostgreSQL/SQLite connection
- **Redis** - Connection to Redis broker
- **Storage** - S3/MinIO accessibility
- **Celery** - Worker connectivity

---

## Performance Monitoring

### Sentry Performance

Sentry automatically tracks:
- HTTP request duration
- Database query performance
- Celery task execution time

View in Sentry dashboard under "Performance".

### Custom Metrics

Add custom metrics using Sentry:

```python
import sentry_sdk

with sentry_sdk.start_transaction(op="task", name="process_video"):
    # Your code here
    sentry_sdk.set_measurement("video_duration", 5.2, "second")
```

---

## Alerting

### Sentry Alerts

Configure alerts in Sentry:

1. **Error rate alerts** - Alert when error rate exceeds threshold
2. **New issue alerts** - Alert when new error types appear
3. **Performance alerts** - Alert when response time degrades

### Log-based Alerts

Set up alerts based on log patterns:

- **Error rate** - Count ERROR level logs
- **Critical errors** - Alert on CRITICAL level
- **Failed logins** - Monitor authentication failures

---

## Best Practices

1. **Use appropriate log levels**
   - DEBUG: Development only
   - INFO: Normal operations
   - WARNING: Potential issues
   - ERROR: Errors that need attention
   - CRITICAL: System failures

2. **Include context**
   - Request IDs for tracing
   - User IDs for user-specific issues
   - Job IDs for background tasks

3. **Don't log sensitive data**
   - No passwords or tokens
   - No PII unless necessary
   - Sentry is configured with `send_default_pii=False`

4. **Monitor regularly**
   - Check Sentry dashboard daily
   - Review error trends weekly
   - Set up alerts for critical issues

5. **Use structured logging**
   - Always use JSON in production
   - Include relevant context
   - Make logs searchable

---

## Troubleshooting

### Sentry not capturing errors

1. Check `SENTRY_ENABLED=true`
2. Verify `SENTRY_DSN` is correct
3. Check Sentry dashboard for connection status
4. Review logs for Sentry initialization messages

### Logs not appearing

1. Check `LOG_LEVEL` setting
2. Verify logger name matches
3. Check log output destination
4. Review logging configuration

### Request IDs missing

1. Ensure middleware is registered
2. Check `X-Request-ID` header in responses
3. Verify logging formatter is configured

---

## Next Steps

- Set up log aggregation service
- Configure Sentry alerts
- Add custom performance metrics
- Set up uptime monitoring
- Create dashboards for key metrics

