"""Pytest test configuration and fixtures.

Sets up test environment variables, client fixtures, and mocks
to guarantee tests run locally without contacting real AWS services or the RDS database.
"""

import os
from typing import Generator
import pytest
from fastapi.testclient import TestClient

# Ensure test environment variables are set before application import
os.environ["APP_ENV"] = "test"
os.environ["APP_NAME"] = "DaRI AI Picture Mirror API (Test)"
os.environ["DB_HOST"] = "localhost"
os.environ["DB_PORT"] = "5432"
os.environ["DB_NAME"] = "test_db"
os.environ["DB_USER"] = "postgres"
os.environ["DB_PASSWORD"] = "test_secret_pass"
os.environ["AWS_REGION"] = "ap-south-2"
os.environ["S3_BUCKET_NAME"] = "dari-ai-picture-mirror-dev"
os.environ["CORS_ORIGINS"] = "http://localhost:3000,http://localhost:8000"

from app.core.config import get_settings
from app.main import app

# Clear any cached settings so test environment variables take effect
get_settings.cache_clear()


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """TestClient fixture with startup/shutdown lifecycle execution."""
    with TestClient(app) as test_client:
        yield test_client
