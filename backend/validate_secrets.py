#!/usr/bin/env python3
"""
AIDIT Secrets Validation Script

This script validates that all required environment variables are properly configured.
Run this before deploying to ensure no secrets are missing.

Usage:
    python validate_secrets.py [--environment dev|staging|prod]
"""

import sys
import os
from typing import List, Dict, Tuple

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from config import settings


class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'


def mask_secret(value: str) -> str:
    """Mask a secret value for safe display"""
    if not value or len(value) < 8:
        return "***"
    return f"{value[:4]}...{value[-4:]}"


def check_required_secrets() -> Tuple[List[str], List[str]]:
    """Check required secrets based on feature flags"""
    required = []
    warnings = []
    
    # Always required for production
    if not settings.DEBUG:
        if not settings.JWT_SECRET_KEY:
            required.append("JWT_SECRET_KEY - Required for authentication")
        if not settings.SESSION_SECRET:
            required.append("SESSION_SECRET - Required for session management")
    
    # Required if PostgreSQL is enabled
    if settings.USE_POSTGRES:
        if not settings.POSTGRES_DSN or settings.POSTGRES_DSN == "postgresql+psycopg://postgres:postgres@postgres:5432/aiditor":
            warnings.append("POSTGRES_DSN - Using default/insecure value")
    
    # Required if object storage is enabled
    if settings.USE_OBJECT_STORAGE:
        if not settings.S3_ACCESS_KEY or settings.S3_ACCESS_KEY == "minioadmin":
            warnings.append("S3_ACCESS_KEY - Using default/insecure value")
        if not settings.S3_SECRET_KEY or settings.S3_SECRET_KEY == "minioadmin":
            warnings.append("S3_SECRET_KEY - Using default/insecure value")
    
    # Billing secrets
    if not settings.STRIPE_SECRET_KEY:
        warnings.append("STRIPE_SECRET_KEY - Billing features will not work")
    
    return required, warnings


def check_optional_secrets() -> Dict[str, bool]:
    """Check optional secrets and return their status"""
    return {
        "Gaming APIs": {
            "Steam": bool(settings.STEAM_API_KEY),
            "Xbox": bool(settings.XBOX_CLIENT_ID and settings.XBOX_CLIENT_SECRET),
            "PlayStation": bool(settings.PSN_NPSSO_TOKEN),
            "Nintendo": bool(settings.NINTENDO_SESSION_TOKEN),
        },
        "AI/ML Services": {
            "OpenAI": bool(settings.OPENAI_API_KEY),
        },
        "Email": {
            "SMTP": bool(settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD),
        },
        "Monitoring": {
            "Sentry": bool(settings.SENTRY_DSN),
            "Analytics": bool(settings.ANALYTICS_API_KEY),
        }
    }


def print_header(text: str):
    """Print a formatted header"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text:^60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")


def print_success(text: str):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")


def print_warning(text: str):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.END}")


def print_error(text: str):
    """Print error message"""
    print(f"{Colors.RED}❌ {text}{Colors.END}")


def print_info(text: str):
    """Print info message"""
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.END}")


def main():
    """Main validation function"""
    print_header("AIDIT Secrets Validation")
    
    # Environment info
    print_info(f"Environment: {'Production' if not settings.DEBUG else 'Development'}")
    print_info(f"PostgreSQL: {'Enabled' if settings.USE_POSTGRES else 'Disabled'}")
    print_info(f"Object Storage: {'Enabled' if settings.USE_OBJECT_STORAGE else 'Disabled'}")
    print_info(f"Highlight Model: {'Enabled' if settings.USE_HIGHLIGHT_MODEL else 'Disabled'}")
    
    # Check required secrets
    print_header("Required Secrets")
    required_missing, warnings = check_required_secrets()
    
    if required_missing:
        print_error("Missing required secrets:")
        for secret in required_missing:
            print(f"  • {secret}")
    else:
        print_success("All required secrets are configured")
    
    if warnings:
        print("\n")
        print_warning("Warnings:")
        for warning in warnings:
            print(f"  • {warning}")
    
    # Check optional secrets
    print_header("Optional Secrets")
    optional = check_optional_secrets()
    
    for category, services in optional.items():
        print(f"\n{Colors.BOLD}{category}:{Colors.END}")
        for service, configured in services.items():
            if configured:
                print_success(f"{service}: Configured")
            else:
                print(f"  ⚪ {service}: Not configured")
    
    # Configuration summary
    print_header("Configuration Summary")
    
    print(f"{Colors.BOLD}Database:{Colors.END}")
    if settings.USE_POSTGRES:
        print(f"  • Type: PostgreSQL")
        print(f"  • DSN: {mask_secret(settings.POSTGRES_DSN)}")
    else:
        print(f"  • Type: SQLite")
        print(f"  • Path: {settings.DB_PATH}")
    
    print(f"\n{Colors.BOLD}Storage:{Colors.END}")
    if settings.USE_OBJECT_STORAGE:
        print(f"  • Type: S3/MinIO")
        print(f"  • Endpoint: {settings.S3_ENDPOINT_URL}")
        print(f"  • Bucket: {settings.S3_BUCKET}")
        print(f"  • Access Key: {mask_secret(settings.S3_ACCESS_KEY)}")
    else:
        print(f"  • Type: Local filesystem")
        print(f"  • Root: {settings.STORAGE_ROOT}")
    
    print(f"\n{Colors.BOLD}Broker:{Colors.END}")
    print(f"  • Redis URL: {mask_secret(settings.REDIS_URL)}")
    
    print(f"\n{Colors.BOLD}Security:{Colors.END}")
    if settings.JWT_SECRET_KEY:
        print_success(f"JWT Secret: Configured ({mask_secret(settings.JWT_SECRET_KEY)})")
    else:
        print_warning("JWT Secret: Not configured")
    
    if settings.SESSION_SECRET:
        print_success(f"Session Secret: Configured ({mask_secret(settings.SESSION_SECRET)})")
    else:
        print_warning("Session Secret: Not configured")
    
    # Final verdict
    print_header("Validation Result")
    
    if required_missing:
        print_error("VALIDATION FAILED")
        print(f"\n{Colors.RED}Cannot proceed with missing required secrets.{Colors.END}")
        print(f"{Colors.RED}Please configure the missing secrets and try again.{Colors.END}")
        return 1
    elif warnings and not settings.DEBUG:
        print_warning("VALIDATION PASSED WITH WARNINGS")
        print(f"\n{Colors.YELLOW}Some optional features may not work correctly.{Colors.END}")
        print(f"{Colors.YELLOW}Review warnings above and configure as needed.{Colors.END}")
        return 0
    else:
        print_success("VALIDATION PASSED")
        print(f"\n{Colors.GREEN}All secrets are properly configured!{Colors.END}")
        return 0


if __name__ == "__main__":
    sys.exit(main())
