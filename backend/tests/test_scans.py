import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_scan_lifecycle():
    # 1. Trigger scan on accessible fixture
    response = client.post(
        "/api/scans",
        json={"url": "http://127.0.0.1:8000/static/test_pages/accessible.html"}
    )
    assert response.status_code == 202
    data = response.json()
    assert "scan_id" in data
    scan_id = data["scan_id"]

    # 2. Get scan results
    scan_res = client.get(f"/api/scans/{scan_id}")
    assert scan_res.status_code == 200
    report = scan_res.json()
    assert report["id"] == scan_id
    assert report["target_url"] == "http://127.0.0.1:8000/static/test_pages/accessible.html"

    # 3. List scans
    list_res = client.get("/api/scans")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 4. Delete scan
    del_res = client.delete(f"/api/scans/{scan_id}")
    assert del_res.status_code == 200
    assert "deleted successfully" in del_res.json()["message"]

def test_scan_inaccessible_fixture_findings():
    # Trigger scan on flawed page
    response = client.post(
        "/api/scans",
        json={"url": "http://127.0.0.1:8000/static/test_pages/inaccessible.html"}
    )
    assert response.status_code == 202
    scan_id = response.json()["scan_id"]

    # Since TestClient background tasks execute synchronously in FastAPI TestClient:
    scan_res = client.get(f"/api/scans/{scan_id}")
    assert scan_res.status_code == 200
    report = scan_res.json()
    assert report["status"] == "completed"
    assert report["total_issues"] > 0
    assert report["critical_count"] > 0

    # Ensure findings contain expected rule violations
    rule_ids = [f["rule_id"] for f in report["findings"]]
    assert "image-alt" in rule_ids
    assert "color-contrast" in rule_ids
    assert "heading-order" in rule_ids
