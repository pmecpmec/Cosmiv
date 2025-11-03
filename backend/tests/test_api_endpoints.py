"""
API Endpoints Tests
Basic tests for critical API endpoints
"""
import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    """Create test FastAPI client"""
    from main import app
    return TestClient(app)


@pytest.fixture
def authenticated_user(client):
    """Create and return authenticated user token"""
    # Register user
    response = client.post(
        "/auth/register",
        json={"email": "api-test@example.com", "password": "TestPass123!"}
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    return {
        "email": "api-test@example.com",
        "token": token,
        "user_id": response.json()["user_id"],
        "headers": {"Authorization": f"Bearer {token}"}
    }


class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check(self, client):
        """Test health check endpoint returns healthy status"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert "checks" in data
        assert data["status"] in ["healthy", "degraded"]
        assert "database" in data["checks"]
        assert "redis" in data["checks"]


class TestAccountsAPI:
    """Test accounts API endpoints"""
    
    def test_list_providers(self, client):
        """Test listing OAuth providers"""
        response = client.get("/api/v2/accounts/providers")
        
        assert response.status_code == 200
        data = response.json()
        assert "providers" in data
        assert isinstance(data["providers"], list)
    
    def test_list_links_requires_auth(self, client):
        """Test listing OAuth links requires authentication"""
        response = client.get("/api/v2/accounts/links")
        
        # Should require authentication
        assert response.status_code in [401, 403]
    
    def test_list_links_with_auth(self, client, authenticated_user):
        """Test listing OAuth links with authentication"""
        response = client.get(
            "/api/v2/accounts/links",
            headers=authenticated_user["headers"]
        )
        
        # Should succeed (even if empty list)
        assert response.status_code == 200
        data = response.json()
        assert "links" in data


class TestBillingAPI:
    """Test billing API endpoints"""
    
    def test_list_plans(self, client):
        """Test listing subscription plans"""
        response = client.get("/api/v2/billing/plans")
        
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        assert isinstance(data["plans"], list)
    
    def test_get_entitlements_requires_auth(self, client):
        """Test getting entitlements requires authentication"""
        response = client.get("/api/v2/billing/entitlements")
        
        assert response.status_code in [401, 403]
    
    def test_get_entitlements_with_auth(self, client, authenticated_user):
        """Test getting entitlements with authentication"""
        response = client.get(
            "/api/v2/billing/entitlements",
            headers=authenticated_user["headers"]
        )
        
        # Should succeed (even if user has no entitlements)
        assert response.status_code == 200


class TestJobsAPI:
    """Test jobs API endpoints"""
    
    def test_list_jobs_requires_auth(self, client):
        """Test listing jobs requires authentication"""
        response = client.get("/api/v2/jobs")
        
        assert response.status_code in [401, 403]
    
    def test_list_jobs_with_auth(self, client, authenticated_user):
        """Test listing jobs with authentication"""
        response = client.get(
            "/api/v2/jobs",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "jobs" in data
        assert isinstance(data["jobs"], list)


class TestAdminAPI:
    """Test admin API endpoints"""
    
    def test_list_users_requires_auth(self, client):
        """Test listing users requires authentication"""
        response = client.get("/admin/users")
        
        assert response.status_code in [401, 403]
    
    def test_list_users_with_auth(self, client, authenticated_user):
        """Test listing users with authentication"""
        response = client.get(
            "/admin/users",
            headers=authenticated_user["headers"]
        )
        
        # Should either succeed (if admin) or return 403 (if not admin)
        assert response.status_code in [200, 403]
    
    def test_get_user_by_id_requires_auth(self, client):
        """Test getting user by ID requires authentication"""
        response = client.get("/admin/users/test-user-id")
        
        assert response.status_code in [401, 403]

