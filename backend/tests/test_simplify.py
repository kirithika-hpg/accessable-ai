import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_assistant_simplify_text():
    sample_dense_text = (
        "In order to facilitate and commence optimal digital transformation, organizations must utilize "
        "comprehensive WCAG frameworks and endeavor to accommodate diverse user personas. Consequently, "
        "we must implement sufficient safeguards."
    )
    response = client.post(
        "/api/assistant/simplify",
        json={"text": sample_dense_text, "level": "plain_english"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "original_text" in data
    assert "simplified_text" in data
    assert "use" in data["simplified_text"].lower() or "help" in data["simplified_text"].lower()
    assert len(data["key_points"]) > 0
    assert "disclaimer" in data

def test_assistant_chat_guidance():
    response = client.post(
        "/api/assistant/chat",
        json={"message": "How does color contrast work in WCAG 2.1?", "context": "home"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "4.5:1" in data["response"] or "contrast" in data["response"].lower()
    assert len(data["suggested_actions"]) > 0
