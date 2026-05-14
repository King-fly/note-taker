"""
Tests for authentication endpoints.
"""

from fastapi.testclient import TestClient

from app.lifespan import create_application

client = TestClient(create_application())


def test_health_check():
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json() == {"message": "ok"}


def test_register_user():
    resp = client.post("/api/v1/auth/register", json={
        "username": "newuser",
        "email": "new@example.com",
        "password": "securepass123",
        "display_name": "New User",
        "grade": "高一",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_user():
    """Register same user twice → 409."""
    payload = {
        "username": "dupuser",
        "email": "dup@example.com",
        "password": "pass123456",
    }
    client.post("/api/v1/auth/register", json=payload)
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 409


def test_login_success():
    """Register then login → 200."""
    client.post("/api/v1/auth/register", json={
        "username": "loginuser",
        "email": "login@example.com",
        "password": "testpass99",
    })
    resp = client.post("/api/v1/auth/login", json={
        "username": "loginuser",
        "password": "testpass99",
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password():
    """Wrong password → 401."""
    client.post("/api/v1/auth/register", json={
        "username": "wrongpwd",
        "email": "wrong@example.com",
        "password": "correctpass",
    })
    resp = client.post("/api/v1/auth/login", json={
        "username": "wrongpwd",
        "password": "wrongpass",
    })
    assert resp.status_code == 401
