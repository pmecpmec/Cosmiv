"""
Billing API Tests
Tests for Stripe integration, subscription management, and webhooks
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
import json
import hmac
import hashlib
from datetime import datetime, timedelta

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


class TestPlanListing:
    """Tests for subscription plan endpoints"""

    def test_list_plans(self, client):
        """Test listing available subscription plans"""
        response = client.get("/api/v2/billing/plans")
        
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        assert isinstance(data["plans"], list)
        assert len(data["plans"]) > 0

    def test_plan_structure(self, client):
        """Test plan structure includes required fields"""
        response = client.get("/api/v2/billing/plans")
        data = response.json()
        
        if len(data["plans"]) > 0:
            plan = data["plans"][0]
            assert "id" in plan
            assert "name" in plan
            assert "price" in plan
            assert "features" in plan

    def test_get_specific_plan(self, client):
        """Test getting a specific plan by ID"""
        response = client.get("/api/v2/billing/plans/free")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "free"

    def test_get_invalid_plan(self, client):
        """Test getting non-existent plan"""
        response = client.get("/api/v2/billing/plans/invalid")
        
        assert response.status_code == 404


class TestCheckout:
    """Tests for Stripe checkout creation"""

    def test_create_checkout_unauthorized(self, client):
        """Test checkout requires authentication"""
        response = client.post(
            "/api/v2/billing/checkout",
            data={"plan": "pro"}
        )
        
        assert response.status_code == 401

    def test_create_checkout_free_plan(self, authenticated_client):
        """Test checkout rejects free plan"""
        response = authenticated_client.post(
            "/api/v2/billing/checkout",
            data={"plan": "free"}
        )
        
        assert response.status_code == 400
        assert "doesn't require checkout" in response.json()["detail"].lower()

    def test_create_checkout_invalid_plan(self, authenticated_client):
        """Test checkout with invalid plan"""
        response = authenticated_client.post(
            "/api/v2/billing/checkout",
            data={"plan": "invalid"}
        )
        
        assert response.status_code == 404

    @patch('api_billing_v2.stripe')
    def test_create_checkout_mock_mode(self, mock_stripe, authenticated_client):
        """Test checkout in mock mode (no Stripe key)"""
        # Mock no Stripe key
        with patch('api_billing_v2.settings.STRIPE_SECRET_KEY', ""):
            response = authenticated_client.post(
                "/api/v2/billing/checkout",
                data={"plan": "pro"}
            )
            
            # Should return mock checkout URL
            assert response.status_code == 200
            data = response.json()
            assert "checkout_url" in data
            assert data.get("mode") == "mock"

    @patch('api_billing_v2.stripe')
    def test_create_checkout_real_stripe(self, mock_stripe, authenticated_client):
        """Test checkout with real Stripe (mocked)"""
        # Mock Stripe checkout session
        mock_session = MagicMock()
        mock_session.url = "https://checkout.stripe.com/test_session"
        mock_stripe.checkout.Session.create.return_value = mock_session
        
        # Mock Stripe being available
        with patch('api_billing_v2.settings.STRIPE_SECRET_KEY', "sk_test_123"):
            with patch('api_billing_v2.stripe', mock_stripe):
                response = authenticated_client.post(
                    "/api/v2/billing/checkout",
                    data={"plan": "pro"}
                )
                
                # Should create Stripe session
                assert response.status_code == 200
                data = response.json()
                assert "checkout_url" in data


class TestWebhook:
    """Tests for Stripe webhook handling"""

    def generate_stripe_signature(self, payload: str, secret: str) -> str:
        """Generate Stripe webhook signature for testing"""
        timestamp = str(int(datetime.utcnow().timestamp()))
        signed_payload = f"{timestamp}.{payload}"
        signature = hmac.new(
            secret.encode(),
            signed_payload.encode(),
            hashlib.sha256
        ).hexdigest()
        return f"t={timestamp},v1={signature}"

    def test_webhook_missing_signature(self, client):
        """Test webhook without signature header"""
        response = client.post(
            "/api/v2/billing/webhook",
            json={"type": "checkout.session.completed"}
        )
        
        # Should reject without signature
        assert response.status_code in [400, 401, 403]

    def test_webhook_invalid_signature(self, client):
        """Test webhook with invalid signature"""
        payload = json.dumps({"type": "checkout.session.completed"})
        
        response = client.post(
            "/api/v2/billing/webhook",
            json=json.loads(payload),
            headers={
                "stripe-signature": "invalid_signature"
            }
        )
        
        # Should reject invalid signature
        assert response.status_code in [400, 401, 403]

    @patch('api_billing_v2.stripe')
    def test_webhook_checkout_completed(self, mock_stripe, client):
        """Test handling checkout.session.completed event"""
        # Mock webhook signature verification
        mock_stripe.Webhook.construct_event.return_value = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "customer": "cus_test",
                    "subscription": "sub_test",
                    "client_reference_id": "user_test123",
                }
            }
        }
        
        payload = json.dumps({
            "type": "checkout.session.completed",
            "data": {"object": {}}
        })
        signature = self.generate_stripe_signature(payload, "test_secret")
        
        with patch('api_billing_v2.settings.STRIPE_WEBHOOK_SECRET', "test_secret"):
            response = client.post(
                "/api/v2/billing/webhook",
                json=json.loads(payload),
                headers={"stripe-signature": signature}
            )
            
            # Should accept webhook
            assert response.status_code in [200, 202]

    @patch('api_billing_v2.stripe')
    def test_webhook_subscription_deleted(self, mock_stripe, client):
        """Test handling subscription.deleted event"""
        mock_stripe.Webhook.construct_event.return_value = {
            "type": "customer.subscription.deleted",
            "data": {
                "object": {
                    "customer": "cus_test",
                    "id": "sub_test",
                }
            }
        }
        
        payload = json.dumps({
            "type": "customer.subscription.deleted",
            "data": {"object": {}}
        })
        signature = self.generate_stripe_signature(payload, "test_secret")
        
        with patch('api_billing_v2.settings.STRIPE_WEBHOOK_SECRET', "test_secret"):
            response = client.post(
                "/api/v2/billing/webhook",
                json=json.loads(payload),
                headers={"stripe-signature": signature}
            )
            
            # Should handle subscription cancellation
            assert response.status_code in [200, 202]


class TestSubscriptionManagement:
    """Tests for subscription management endpoints"""

    def test_get_subscription_unauthorized(self, client):
        """Test getting subscription requires authentication"""
        response = client.get("/api/v2/billing/subscription")
        
        assert response.status_code == 401

    def test_get_subscription_no_subscription(self, authenticated_client):
        """Test getting subscription when user has none"""
        response = authenticated_client.get("/api/v2/billing/subscription")
        
        # Should return no subscription or free plan
        assert response.status_code == 200
        data = response.json()
        # May return null or free plan
        assert "plan" in data or "subscription" in data

    @patch('api_billing_v2.stripe')
    def test_cancel_subscription(self, mock_stripe, authenticated_client):
        """Test canceling subscription"""
        # Mock Stripe subscription cancellation
        mock_stripe.Subscription.modify.return_value = MagicMock(
            cancel_at_period_end=True
        )
        
        with patch('api_billing_v2.settings.STRIPE_SECRET_KEY', "sk_test_123"):
            response = authenticated_client.post("/api/v2/billing/subscription/cancel")
            
            # Should cancel subscription
            assert response.status_code in [200, 202]


class TestEntitlement:
    """Tests for user entitlement/plan access"""

    def test_get_entitlement_unauthorized(self, client):
        """Test getting entitlement requires authentication"""
        response = client.get("/api/v2/billing/entitlement")
        
        assert response.status_code == 401

    def test_get_entitlement_default_free(self, authenticated_client):
        """Test default entitlement is free plan"""
        response = authenticated_client.get("/api/v2/billing/entitlement")
        
        assert response.status_code == 200
        data = response.json()
        # Should have plan information
        assert "plan" in data or "tier" in data

