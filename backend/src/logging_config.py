"""
Structured logging configuration for Cosmiv
Supports JSON logging for production and human-readable for development
"""

import logging
import json
import sys
from datetime import datetime
from typing import Any, Dict
from config import settings


class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging in production"""

    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add request ID if available (from context or record)
        import contextvars
        request_id_var = contextvars.ContextVar('request_id', default=None)
        request_id = request_id_var.get()
        if request_id:
            log_data["request_id"] = request_id
        elif hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id

        # Add user ID if available
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id

        # Add job ID if available
        if hasattr(record, "job_id"):
            log_data["job_id"] = record.job_id

        # Add extra fields
        if hasattr(record, "extra_data"):
            log_data.update(record.extra_data)

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
            log_data["exception_type"] = record.exc_info[0].__name__ if record.exc_info[0] else None

        return json.dumps(log_data)


class StructuredFormatter(logging.Formatter):
    """Human-readable structured formatter for development"""

    def format(self, record: logging.LogRecord) -> str:
        # Base format
        parts = [
            f"[{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}]",
            f"[{record.levelname:8s}]",
            f"[{record.name}]",
        ]

        # Add request ID if available
        if hasattr(record, "request_id"):
            parts.append(f"[req={record.request_id[:8]}]")

        # Add user ID if available
        if hasattr(record, "user_id"):
            parts.append(f"[user={record.user_id[:8]}]")

        # Add job ID if available
        if hasattr(record, "job_id"):
            parts.append(f"[job={record.job_id[:8]}]")

        parts.append(record.getMessage())

        # Add exception if present
        if record.exc_info:
            parts.append(f"\n{self.formatException(record.exc_info)}")

        return " ".join(parts)


def setup_logging():
    """Configure logging based on environment"""
    # Get log level from settings
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    # Create root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Remove existing handlers
    root_logger.handlers.clear()

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)

    # Use JSON formatter in production, structured in development
    if settings.ENVIRONMENT == "production":
        formatter = JSONFormatter()
    else:
        formatter = StructuredFormatter()

    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Suppress noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)

    return root_logger


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the given name"""
    return logging.getLogger(name)


class RequestIDFilter(logging.Filter):
    """Filter to add request ID to log records"""

    def filter(self, record: logging.LogRecord) -> bool:
        # Request ID is set by middleware
        # This filter just ensures it's available
        return True

