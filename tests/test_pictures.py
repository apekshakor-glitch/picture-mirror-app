"""Tests for Picture API placeholder routes."""

from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from app.api.routes.pictures import get_picture_service


def test_list_pictures_placeholder(client: TestClient) -> None:
    """Test that GET /api/v1/pictures returns a documented empty list."""
    mock_service = MagicMock()
    mock_service.list_pictures.return_value = []

    from app.main import app

    app.dependency_overrides[get_picture_service] = lambda: mock_service
    try:
        response = client.get("/api/v1/pictures")
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0
        assert "Placeholder" in data["note"]
    finally:
        app.dependency_overrides.pop(get_picture_service, None)


def test_process_picture_placeholder(client: TestClient) -> None:
    """Test that POST /api/v1/pictures/process returns a 202 placeholder acknowledgment."""
    mock_service = MagicMock()
    mock_service.request_picture_processing.return_value = {
        "status": "pending_implementation",
        "message": "Picture mirror processing pipeline is queued for future development.",
        "requested_filename": "portrait.jpg",
    }

    from app.main import app

    app.dependency_overrides[get_picture_service] = lambda: mock_service
    try:
        payload = {
            "filename": "portrait.jpg",
            "content_type": "image/jpeg",
            "style_preset": "cyberpunk_mirror",
        }
        response = client.post("/api/v1/pictures/process", json=payload)
        assert response.status_code == 202
        data = response.json()
        assert data["status"] == "pending_implementation"
        assert data["requested_filename"] == "portrait.jpg"
    finally:
        app.dependency_overrides.pop(get_picture_service, None)
