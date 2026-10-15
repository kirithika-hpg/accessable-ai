import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_extract_local_accessible_fixture():
    response = client.post(
        "/api/content/extract",
        json={"url": "http://127.0.0.1:8000/static/test_pages/accessible.html"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["supported"] is True
    assert "Accessible Enterprise Services" in data["title"] or "Accessible" in data["title"]
    assert len(data["plain_text"]) > 50
    assert data["word_count"] > 10
    assert data["estimated_read_time_minutes"] >= 1
    assert "notice" in data

def test_extract_ssrf_blocked():
    # Attempting to extract loopback or private ranges outside fixture
    response = client.post(
        "/api/content/extract",
        json={"url": "http://127.0.0.1:8000/admin/secrets"}
    )
    assert response.status_code == 400
    assert "Security policy blocked" in response.json()["detail"]

def test_extract_invalid_scheme():
    response = client.post(
        "/api/content/extract",
        json={"url": "file:///etc/passwd"}
    )
    assert response.status_code == 400
    assert "Security policy blocked" in response.json()["detail"]
