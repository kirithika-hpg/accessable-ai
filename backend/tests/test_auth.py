import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_guest_session():
    response = client.post("/api/auth/guest")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["is_guest"] is True

def test_user_registration_and_login():
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    reg_response = client.post(
        "/api/auth/register",
        json={
            "email": unique_email,
            "password": "StrongPassword123!",
            "full_name": "Test Engineer"
        }
    )
    assert reg_response.status_code == 201
    token_data = reg_response.json()
    token = token_data["access_token"]

    # Verify login
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": unique_email,
            "password": "StrongPassword123!"
        }
    )
    assert login_response.status_code == 200

    # Verify /me endpoint with Bearer token
    me_response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == unique_email
