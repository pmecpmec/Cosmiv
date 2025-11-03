"""
Authentication API Tests
Tests for JWT token generation, login, register, and token validation
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from db import get_session
from models import User
from auth import (
    hash_password,
    verify_password,
    authenticate_user,
    get_password_hash,
    decode_token,
)
from security import create_access_token
import os


@pytest.fixture
def client():
    """Create test FastAPI client"""
    # Import here to avoid circular imports
    from main import app
    return TestClient(app)


@pytest.fixture
def test_user(client):
    """Create a test user and return credentials"""
    email = "test@example.com"
    password = "TestPassword123!"
    
    # Register user
    response = client.post(
        "/auth/register",
        json={"email": email, "password": password}
    )
    assert response.status_code == 200
    data = response.json()
    
    return {
        "email": email,
        "password": password,
        "user_id": data["user_id"],
        "token": data["access_token"],
    }


class TestPasswordHashing:
    """Test password hashing and verification"""
    
    def test_hash_password(self):
        """Test password hashing creates a hash"""
        password = "TestPassword123!"
        hashed = hash_password(password)
        
        assert hashed != password
        assert len(hashed) > 20  # bcrypt hashes are long
        assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    
    def test_verify_password_correct(self):
        """Test password verification with correct password"""
        password = "TestPassword123!"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password"""
        password = "TestPassword123!"
        wrong_password = "WrongPassword"
        hashed = hash_password(password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_get_password_hash_alias(self):
        """Test get_password_hash is an alias for hash_password"""
        password = "TestPassword123!"
        hash1 = hash_password(password)
        hash2 = get_password_hash(password)
        
        # Both should be valid hashes (may differ due to salt)
        assert hash1 != hash2  # Different salts
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


class TestUserRegistration:
    """Test user registration endpoint"""
    
    def test_register_success(self, client):
        """Test successful user registration"""
        response = client.post(
            "/auth/register",
            json={"email": "newuser@example.com", "password": "SecurePass123!"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "user_id" in data
        assert len(data["user_id"]) > 0
        
        # Verify user was created in database
        with get_session() as session:
            user = session.exec(
                select(User).where(User.email == "newuser@example.com")
            ).first()
            assert user is not None
            assert user.email == "newuser@example.com"
            assert user.password_hash is not None
            assert user.user_id == data["user_id"]
    
    def test_register_duplicate_email(self, client):
        """Test registration with duplicate email fails"""
        email = "duplicate@example.com"
        password = "Password123!"
        
        # First registration should succeed
        response1 = client.post(
            "/auth/register",
            json={"email": email, "password": password}
        )
        assert response1.status_code == 200
        
        # Second registration with same email should fail
        response2 = client.post(
            "/auth/register",
            json={"email": email, "password": password}
        )
        assert response2.status_code == 400
        assert "already registered" in response2.json()["detail"].lower()
    
    def test_register_invalid_email(self, client):
        """Test registration with invalid email format fails"""
        response = client.post(
            "/auth/register",
            json={"email": "not-an-email", "password": "Password123!"}
        )
        
        assert response.status_code == 422  # Validation error


class TestUserLogin:
    """Test user login endpoint"""
    
    def test_login_success(self, client, test_user):
        """Test successful login with correct credentials"""
        response = client.post(
            "/auth/login",
            json={"email": test_user["email"], "password": test_user["password"]}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "user_id" in data
        assert data["user_id"] == test_user["user_id"]
    
    def test_login_wrong_password(self, client, test_user):
        """Test login with wrong password fails"""
        response = client.post(
            "/auth/login",
            json={"email": test_user["email"], "password": "WrongPassword"}
        )
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower() or "invalid" in response.json()["detail"].lower()
    
    def test_login_nonexistent_user(self, client):
        """Test login with non-existent email fails"""
        response = client.post(
            "/auth/login",
            json={"email": "nonexistent@example.com", "password": "Password123!"}
        )
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower() or "invalid" in response.json()["detail"].lower()
    
    def test_login_invalid_email_format(self, client):
        """Test login with invalid email format fails"""
        response = client.post(
            "/auth/login",
            json={"email": "not-an-email", "password": "Password123!"}
        )
        
        assert response.status_code == 422  # Validation error


class TestAuthenticateUser:
    """Test authenticate_user function"""
    
    def test_authenticate_user_success(self, client, test_user):
        """Test authentication with correct credentials"""
        user = authenticate_user(test_user["email"], test_user["password"])
        
        assert user is not None
        assert user.email == test_user["email"]
        assert user.user_id == test_user["user_id"]
    
    def test_authenticate_user_wrong_password(self, client, test_user):
        """Test authentication with wrong password returns None"""
        user = authenticate_user(test_user["email"], "WrongPassword")
        
        assert user is None
    
    def test_authenticate_user_nonexistent(self):
        """Test authentication with non-existent user returns None"""
        user = authenticate_user("nonexistent@example.com", "Password123!")
        
        assert user is None


class TestJWTToken:
    """Test JWT token generation and validation"""
    
    def test_create_access_token(self):
        """Test access token creation"""
        user_id = "test-user-123"
        email = "test@example.com"
        
        token = create_access_token(data={"sub": user_id, "email": email})
        
        assert token is not None
        assert len(token) > 20  # JWT tokens are long
        assert "." in token  # JWTs have dots
    
    def test_decode_token_success(self):
        """Test token decoding with valid token"""
        user_id = "test-user-123"
        email = "test@example.com"
        
        token = create_access_token(data={"sub": user_id, "email": email})
        decoded = decode_token(token)
        
        assert decoded is not None
        assert decoded["sub"] == user_id
        assert decoded["email"] == email
    
    def test_decode_token_invalid(self):
        """Test token decoding with invalid token"""
        invalid_token = "invalid.token.here"
        decoded = decode_token(invalid_token)
        
        assert decoded is None
    
    def test_token_in_registration_response(self, client):
        """Test that registration returns a valid token"""
        response = client.post(
            "/auth/register",
            json={"email": "token-test@example.com", "password": "Password123!"}
        )
        
        assert response.status_code == 200
        data = response.json()
        token = data["access_token"]
        
        # Verify token can be decoded
        decoded = decode_token(token)
        assert decoded is not None
        assert decoded["sub"] == data["user_id"]
        assert decoded["email"] == "token-test@example.com"


class TestProtectedEndpoints:
    """Test endpoints that require authentication"""
    
    def test_get_current_user_with_valid_token(self, client, test_user):
        """Test accessing protected endpoint with valid token"""
        # Get a protected endpoint - using admin users endpoint as example
        response = client.get(
            "/admin/users",
            headers={"Authorization": f"Bearer {test_user['token']}"}
        )
        
        # Should either succeed (if user is admin) or return 403 (if not admin)
        # Both are valid - the important thing is it's not 401 (unauthorized)
        assert response.status_code in [200, 403]
    
    def test_get_current_user_without_token(self, client):
        """Test accessing protected endpoint without token fails"""
        response = client.get("/admin/users")
        
        # Should return 401 or 403 (unauthorized)
        assert response.status_code in [401, 403]
    
    def test_get_current_user_with_invalid_token(self, client):
        """Test accessing protected endpoint with invalid token fails"""
        response = client.get(
            "/admin/users",
            headers={"Authorization": "Bearer invalid.token.here"}
        )
        
        # Should return 401 (unauthorized)
        assert response.status_code in [401, 403]


class TestUserModelPasswordHash:
    """Test that User model properly stores password hash"""
    
    def test_user_has_password_hash_after_registration(self, client):
        """Test that registered user has password_hash in database"""
        email = "hash-test@example.com"
        password = "TestPassword123!"
        
        # Register user
        response = client.post(
            "/auth/register",
            json={"email": email, "password": password}
        )
        assert response.status_code == 200
        
        # Check database
        with get_session() as session:
            user = session.exec(
                select(User).where(User.email == email)
            ).first()
            
            assert user is not None
            assert user.password_hash is not None
            assert len(user.password_hash) > 0
            
            # Verify the hash matches the password
            assert verify_password(password, user.password_hash) is True

