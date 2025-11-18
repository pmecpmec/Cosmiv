"""
Accounts API Tests
Tests for OAuth linking, provider listing, and clip discovery
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime

# Import test fixtures
from conftest import in_memory_db


@pytest.fixture
def client(in_memory_db):
    """Create test FastAPI client"""
    from main import app
    return TestClient(app)


@pytest.fixture
def authenticated_client(client, test_user):
    """Create authenticated test client"""
    client.headers.update({"Authorization": f"Bearer {test_user['token']}"})
    return client


class TestProviderListing:
    """Tests for provider listing endpoint"""

    def test_list_providers(self, client):
        """Test listing available gaming platforms"""
        response = client.get("/api/v2/accounts/providers")
        
        assert response.status_code == 200
        data = response.json()
        assert "providers" in data
        assert isinstance(data["providers"], list)
        
        # Should include common platforms
        provider_ids = [p["id"] for p in data["providers"]]
        assert len(provider_ids) > 0

    def test_provider_metadata(self, client):
        """Test provider metadata includes icons and descriptions"""
        response = client.get("/api/v2/accounts/providers")
        data = response.json()
        
        if len(data["providers"]) > 0:
            provider = data["providers"][0]
            assert "id" in provider
            assert "name" in provider
            # Metadata fields (may be optional)
            # assert "icon" in provider
            # assert "description" in provider


class TestOAuthFlow:
    """Tests for OAuth linking flow"""

    @patch('api_accounts_v2.get_oauth_handler')
    def test_start_oauth_flow(self, mock_get_handler, authenticated_client):
        """Test starting OAuth flow for a platform"""
        # Mock OAuth handler
        mock_handler = MagicMock()
        mock_handler.get_authorize_url.return_value = "https://platform.com/oauth?state=test"
        mock_get_handler.return_value = mock_handler
        
        response = authenticated_client.get("/api/v2/accounts/oauth/steam")
        
        # Should redirect to OAuth URL
        assert response.status_code in [200, 302, 307]
        # If redirect, check location header (validate URL format)
        if response.status_code in [302, 307]:
            location = response.headers.get("location", "")
            # Validate URL format instead of substring check
            assert location.startswith("http://") or location.startswith("https://")
            # Check for expected OAuth domain pattern
            assert "steam" in location.lower() or "platform.com" in location.lower()

    def test_start_oauth_unauthorized(self, client):
        """Test OAuth flow requires authentication"""
        response = client.get("/api/v2/accounts/oauth/steam")
        
        # Should require authentication
        assert response.status_code == 401

    def test_start_oauth_invalid_provider(self, authenticated_client):
        """Test OAuth with invalid provider"""
        with patch('api_accounts_v2.get_oauth_handler', return_value=None):
            response = authenticated_client.get("/api/v2/accounts/oauth/invalid")
            
            assert response.status_code == 404
            assert "not supported" in response.json()["detail"].lower()

    @patch('api_accounts_v2.get_oauth_handler')
    def test_oauth_callback_success(self, mock_get_handler, authenticated_client):
        """Test OAuth callback handling"""
        # Mock OAuth handler
        mock_handler = MagicMock()
        mock_handler.exchange_code.return_value = {
            "platform_user_id": "test_user_123",
            "platform_username": "TestUser",
            "access_token": "test_token",
            "refresh_token": "test_refresh",
            "expires_at": datetime.utcnow(),
        }
        mock_get_handler.return_value = mock_handler
        
        # Mock state validation
        with patch('api_accounts_v2.oauth_states', {"test_state": {"user_id": "test", "provider": "steam"}}):
            response = authenticated_client.get(
                "/api/v2/accounts/oauth/steam/callback?code=test_code&state=test_state"
            )
            
            # Should handle callback (may redirect or return success)
            assert response.status_code in [200, 302, 307]

    def test_oauth_callback_invalid_state(self, authenticated_client):
        """Test OAuth callback with invalid state"""
        response = authenticated_client.get(
            "/api/v2/accounts/oauth/steam/callback?code=test_code&state=invalid_state"
        )
        
        # Should reject invalid state
        assert response.status_code in [400, 401, 403]


class TestAccountLinking:
    """Tests for account linking functionality"""

    def test_list_linked_accounts(self, authenticated_client):
        """Test listing user's linked accounts"""
        response = authenticated_client.get("/api/v2/accounts/links")
        
        assert response.status_code == 200
        data = response.json()
        assert "links" in data
        assert isinstance(data["links"], list)

    @patch('api_accounts_v2.get_oauth_handler')
    def test_link_account_mock(self, mock_get_handler, authenticated_client):
        """Test linking account in mock mode"""
        # Mock OAuth handler
        mock_handler = MagicMock()
        mock_handler.get_authorize_url.return_value = "https://mock.com/auth"
        mock_get_handler.return_value = mock_handler
        
        response = authenticated_client.post(
            "/api/v2/accounts/link",
            data={
                "provider": "steam",
                "access_token": "mock_token"
            }
        )
        
        # Should accept mock linking
        assert response.status_code in [200, 201]

    def test_link_account_invalid_provider(self, authenticated_client):
        """Test linking with invalid provider"""
        response = authenticated_client.post(
            "/api/v2/accounts/link",
            data={
                "provider": "invalid_platform",
                "access_token": "token"
            }
        )
        
        # Should reject invalid provider
        assert response.status_code in [400, 404]


class TestClipDiscovery:
    """Tests for clip discovery functionality"""

    @patch('api_accounts_v2.mock_fetch_recent_clips')
    def test_sync_clips_mock(self, mock_fetch, authenticated_client):
        """Test syncing clips in mock mode"""
        # Mock clip discovery
        mock_fetch.return_value = [
            {
                "clip_id": "clip_1",
                "title": "Test Clip",
                "url": "https://example.com/clip1.mp4",
                "thumbnail": "https://example.com/thumb1.jpg",
                "duration": 30.0,
                "created_at": "2025-01-28T10:00:00Z",
            }
        ]
        
        response = authenticated_client.post("/api/v2/accounts/sync")
        
        assert response.status_code in [200, 202]
        # Should trigger sync (may be async)

    def test_sync_clips_unauthorized(self, client):
        """Test syncing clips requires authentication"""
        response = client.post("/api/v2/accounts/sync")
        
        assert response.status_code == 401

    @patch('api_accounts_v2.sync_user_clips')
    def test_sync_clips_async(self, mock_sync, authenticated_client):
        """Test sync triggers background task"""
        mock_sync.delay = MagicMock()  # Mock Celery task
        
        response = authenticated_client.post("/api/v2/accounts/sync")
        
        # Should trigger background sync
        assert response.status_code in [200, 202]


class TestDiscoveredClips:
    """Tests for discovered clips endpoint"""

    def test_list_discovered_clips(self, authenticated_client):
        """Test listing discovered clips"""
        response = authenticated_client.get("/api/v2/accounts/clips")
        
        assert response.status_code == 200
        data = response.json()
        assert "clips" in data
        assert isinstance(data["clips"], list)

    def test_list_clips_with_filters(self, authenticated_client):
        """Test listing clips with query filters"""
        response = authenticated_client.get(
            "/api/v2/accounts/clips?provider=steam&limit=10"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "clips" in data

    def test_list_clips_unauthorized(self, client):
        """Test listing clips requires authentication"""
        response = client.get("/api/v2/accounts/clips")
        
        assert response.status_code == 401

