"""Tests for configuration validation, URL encoding, and credential masking."""

import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_settings_default_values() -> None:
    """Test standard settings defaults."""
    settings = Settings(
        DB_HOST="test-host.rds.amazonaws.com",
        DB_USER="postgres",
        DB_PASSWORD="plainpassword",
        DB_NAME="testdb",
        DB_PORT=5432,
    )
    assert settings.DB_PORT == 5432
    assert "postgresql+psycopg2://" in settings.sqlalchemy_database_uri
    assert "plainpassword" in settings.sqlalchemy_database_uri


def test_special_characters_in_password_url_encoding() -> None:
    """Test that special characters in passwords (e.g. @, :, #, %, /) are safely encoded."""
    complex_password = "p@ss:w/ord#1%extra"
    settings = Settings(
        DB_HOST="test-host.rds.amazonaws.com",
        DB_USER="postgres",
        DB_PASSWORD=complex_password,
        DB_NAME="testdb",
    )
    uri = settings.sqlalchemy_database_uri
    # Must not contain unencoded @ or : in the password segment that breaks URL parsing
    assert complex_password not in uri
    assert "p%40ss%3Aw%2Ford%231%25extra" in uri


def test_safe_database_uri_masks_password() -> None:
    """Test that get_safe_database_uri_for_logging redacts the password."""
    settings = Settings(
        DB_HOST="dariai-picture-mirror-dev.c7em0as8esn6.ap-south-2.rds.amazonaws.com",
        DB_USER="postgres",
        DB_PASSWORD="super_secret_rds_password_12345",
        DB_NAME="postgres",
    )
    safe_uri = settings.get_safe_database_uri_for_logging()
    assert "super_secret_rds_password_12345" not in safe_uri
    assert ":***@" in safe_uri
    assert "dariai-picture-mirror-dev.c7em0as8esn6.ap-south-2.rds.amazonaws.com" in safe_uri


def test_cors_origins_parsing() -> None:
    """Test parsing of CORS_ORIGINS from comma-separated string."""
    settings = Settings(
        CORS_ORIGINS="https://app.dari.ai, https://mirror.dari.ai",
        DB_HOST="localhost",
    )
    assert settings.CORS_ORIGINS == ["https://app.dari.ai", "https://mirror.dari.ai"]


def test_direct_database_url_normalization() -> None:
    """Test that postgres:// is normalized to postgresql+psycopg2://."""
    settings = Settings(
        DATABASE_URL="postgres://user:pass@host:5432/dbname",
    )
    assert settings.sqlalchemy_database_uri.startswith("postgresql+psycopg2://")


def test_invalid_configuration_port_type() -> None:
    """Test that invalid configuration types raise Pydantic ValidationError."""
    with pytest.raises(ValidationError):
        Settings(DB_PORT="not_a_valid_port_number")  # type: ignore
