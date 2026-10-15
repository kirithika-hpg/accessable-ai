import pytest
from app.core.ssrf_validator import validate_target_url

def test_block_loopback():
    valid, _, err = validate_target_url("http://127.0.0.1:8080/admin")
    assert not valid
    assert "blocked" in err.lower() or "loopback" in err.lower()

def test_block_localhost_domain():
    valid, _, err = validate_target_url("http://localhost:3000/secret")
    assert not valid
    assert "forbidden" in err.lower() or "blocked" in err.lower()

def test_block_private_class_a():
    valid, _, err = validate_target_url("http://10.0.1.5/dashboard")
    assert not valid
    assert "blocked" in err.lower()

def test_block_private_class_c():
    valid, _, err = validate_target_url("http://192.168.1.1/router")
    assert not valid
    assert "blocked" in err.lower()

def test_block_cloud_metadata():
    valid, _, err = validate_target_url("http://169.254.169.254/latest/meta-data/")
    assert not valid
    assert "blocked" in err.lower()

def test_block_invalid_schemes():
    valid, _, err = validate_target_url("file:///etc/passwd")
    assert not valid

def test_allow_local_test_fixture():
    valid, url, _ = validate_target_url("http://127.0.0.1:8000/static/test_pages/inaccessible.html")
    assert valid
    assert "inaccessible.html" in url
