"""Tests for health, database readiness, and S3 status endpoints."""

from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.services.s3_service import get_s3_service


def test_basic_health(client: TestClient) -> None:
    """Test that GET /health returns 200 without exposing secrets."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["environment"] == "test"
    # Ensure no credentials or hostnames are leaked
    assert "password" not in response.text.lower()
    assert "c7em0as8esn6" not in response.text.lower()


def test_database_readiness_success(client: TestClient) -> None:
    """Test GET /health/ready returns 200 when database connectivity succeeds."""
    with patch("app.api.routes.health.check_database_readiness", return_value=(True, None)):
        response = client.get("/health/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"
        assert data["database"] == "connected"
        assert "verified" in data["detail"]


def test_database_readiness_failure(client: TestClient) -> None:
    """Test GET /health/ready returns 503 when database is unreachable."""
    with patch(
        "app.api.routes.health.check_database_readiness",
        return_value=(False, "Database connection unavailable"),
    ):
        response = client.get("/health/ready")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "unhealthy"
        assert data["database"] == "unavailable"
        assert "Database connection unavailable" in data["detail"]


def test_s3_health_success(client: TestClient) -> None:
    """Test GET /health/s3 returns 200 when S3 bucket is accessible."""
    mock_s3_service = MagicMock()
    mock_s3_service.bucket_name = "dari-ai-picture-mirror-dev"
    mock_s3_service.check_bucket_accessibility.return_value = (True, "S3 bucket accessible")

    # Override the FastAPI dependency
    from app.main import app

    app.dependency_overrides[get_s3_service] = lambda: mock_s3_service
    try:
        response = client.get("/health/s3")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"
        assert data["s3"] == "accessible"
        assert data["bucket"] == "dari-ai-picture-mirror-dev"
    finally:
        app.dependency_overrides.pop(get_s3_service, None)


def test_s3_health_failure(client: TestClient) -> None:
    """Test GET /health/s3 returns 503 when S3 bucket check fails."""
    mock_s3_service = MagicMock()
    mock_s3_service.bucket_name = "dari-ai-picture-mirror-dev"
    mock_s3_service.check_bucket_accessibility.return_value = (
        False,
        "Access denied to configured S3 bucket",
    )

    from app.main import app

    app.dependency_overrides[get_s3_service] = lambda: mock_s3_service
    try:
        response = client.get("/health/s3")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "unhealthy"
        assert data["s3"] == "unavailable"
        assert "Access denied" in data["detail"]
    finally:
        app.dependency_overrides.pop(get_s3_service, None)
