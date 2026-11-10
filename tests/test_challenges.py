"""Unit tests for Challenge Image S3 Lifecycle and 24-Hour Reuse Rule."""

import base64
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock
import uuid
import pytest
from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app
from app.models.challenge import Challenge
from app.services.s3_service import get_s3_service


SAMPLE_PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"\x00" * 120
SAMPLE_PNG_B64 = "data:image/png;base64," + base64.b64encode(SAMPLE_PNG_BYTES).decode()


class MockS3Service:
    def __init__(self):
        self.storage = {}

    def upload_bytes(self, object_key: str, data: bytes, content_type: str = "image/png") -> str:
        self.storage[object_key] = (data, content_type)
        return object_key

    def get_object_bytes(self, object_key: str):
        if object_key not in self.storage:
            raise Exception("NoSuchKey")
        return self.storage[object_key]

    def generate_presigned_download_url(self, object_key: str, expires_in: int = 86400) -> str:
        return f"https://dari-ai-picture-mirror-dev.s3.ap-south-2.amazonaws.com/{object_key}?token=mock"


class MockDB:
    def __init__(self):
        self.challenges = []

    def query(self, model):
        class QueryMock:
            def __init__(self, items):
                self._items = items

            def filter(self, *criteria):
                return QueryMock(self._items)

            def order_by(self, *args):
                return self

            def limit(self, n):
                return QueryMock(self._items[:n])

            def all(self):
                return self._items

            def first(self):
                return self._items[0] if self._items else None

        return QueryMock(self.challenges)

    def add(self, item):
        self.challenges.append(item)

    def commit(self):
        pass

    def refresh(self, item):
        pass

    def get(self, model, item_id):
        for c in self.challenges:
            if str(c.id) == str(item_id):
                return c
        return None


def test_next_challenge_when_empty(client: TestClient):
    mock_db = MockDB()
    mock_s3 = MockS3Service()

    def override_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_s3_service] = lambda: mock_s3
    try:
        response = client.get("/api/challenges/next?level=1")
        assert response.status_code == 200
        data = response.json()
        assert data["reused"] is False
        assert "No challenge images saved before 24 hours" in data["message"]
    finally:
        app.dependency_overrides.clear()


def test_upload_challenge_and_verify_not_reused_within_24_hours(client: TestClient):
    mock_db = MockDB()
    mock_s3 = MockS3Service()

    def override_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_s3_service] = lambda: mock_s3
    try:
        # Upload fresh challenge
        upload_resp = client.post(
            "/api/challenges/upload",
            json={
                "prompt": "A glowing neon umbrella with circuit patterns",
                "level": 2,
                "image_b64": SAMPLE_PNG_B64,
            },
        )
        assert upload_resp.status_code == 201
        upload_data = upload_resp.json()
        assert upload_data["ok"] is True
        assert "s3_key" in upload_data

        # Directly after upload, it is < 24h old, so it cannot be reused yet
        mock_db.challenges.clear()  # No challenges older than 24h
        next_resp = client.get("/api/challenges/next?level=2")
        assert next_resp.status_code == 200
        assert next_resp.json()["reused"] is False
    finally:
        app.dependency_overrides.clear()


def test_challenge_eligible_for_reuse_after_24_hours(client: TestClient):
    mock_db = MockDB()
    mock_s3 = MockS3Service()

    def override_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_s3_service] = lambda: mock_s3
    try:
        challenge_id = uuid.uuid4()
        s3_key = f"challenges/{challenge_id}.png"
        mock_s3.upload_bytes(s3_key, SAMPLE_PNG_BYTES)

        created_25h_ago = datetime.now(timezone.utc) - timedelta(hours=25)
        old_challenge = Challenge(
            id=challenge_id,
            theme="cyberpunk",
            difficulty="medium",
            title="A glowing neon umbrella",
            reference_image_s3_key=s3_key,
            metadata_json={"prompt": "A glowing neon umbrella with circuit patterns"},
            is_active=True,
            created_at=created_25h_ago,
            updated_at=created_25h_ago,
        )
        mock_db.add(old_challenge)

        next_resp = client.get("/api/challenges/next?level=2")
        assert next_resp.status_code == 200
        data = next_resp.json()
        assert data["reused"] is True
        assert data["challenge_id"] == str(challenge_id)
        assert data["hidden_prompt"] == "A glowing neon umbrella with circuit patterns"
        assert f"/api/challenges/{challenge_id}/image" in data["image_url"]
    finally:
        app.dependency_overrides.clear()


def test_get_challenge_image_bytes(client: TestClient):
    mock_db = MockDB()
    mock_s3 = MockS3Service()

    def override_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_s3_service] = lambda: mock_s3
    try:
        challenge_id = uuid.uuid4()
        s3_key = f"challenges/{challenge_id}.png"
        mock_s3.upload_bytes(s3_key, SAMPLE_PNG_BYTES)

        challenge = Challenge(
            id=challenge_id,
            theme="nature",
            difficulty="easy",
            title="A calm mountain lake",
            reference_image_s3_key=s3_key,
            metadata_json={"prompt": "A calm mountain lake at sunrise"},
            is_active=True,
        )
        mock_db.add(challenge)

        resp = client.get(f"/api/challenges/{challenge_id}/image")
        assert resp.status_code == 200
        assert resp.content == SAMPLE_PNG_BYTES
        assert resp.headers["content-type"] == "image/png"
        assert "public, max-age=86400" in resp.headers["cache-control"]
    finally:
        app.dependency_overrides.clear()
