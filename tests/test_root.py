"""Tests for the root endpoint GET / and GET /api."""

from fastapi.testclient import TestClient


def test_read_root_api(client: TestClient) -> None:
    """Test that GET /api returns a 200 with service information and environment."""
    response = client.get("/api")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "DaRI AI Picture Mirror API" in data["message"]
    assert data["environment"] == "test"
    assert data["version"] == "0.1.0"


def test_read_root_web(client: TestClient) -> None:
    """Test that GET / returns 200 with the arcade web app index.html."""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")
    assert "DaRI AI" in response.text
