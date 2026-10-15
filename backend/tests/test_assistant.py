import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_assistant_explain():
    response = client.post(
        "/api/assistant/explain",
        json={
            "rule_id": "image-alt",
            "description": "Images must have alternate text",
            "html_snippet": '<img src="header.jpg">'
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["rule_id"] == "image-alt"
    assert "simple_explanation" in data
    assert "why_it_matters" in data
    assert "blind" in data["impact_by_disability"]

def test_assistant_suggest_fix():
    response = client.post(
        "/api/assistant/suggest-fix",
        json={
            "rule_id": "button-name",
            "html_snippet": '<button class="submit-btn"><i class="icon"></i></button>',
            "description": "Buttons must have discernible text"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["rule_id"] == "button-name"
    assert "suggested_snippet" in data
    assert "explanation_of_fix" in data
