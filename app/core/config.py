"""Application configuration module using Pydantic Settings.

Reads configuration from environment variables and an optional .env file.
Secrets such as database passwords and AWS credentials are never hardcoded.
"""

from functools import lru_cache
from typing import List, Optional, Union
from urllib.parse import quote_plus, urlsplit, urlunsplit

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable loading and validation."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    # Core Application Settings
    APP_NAME: str = "DaRI AI Picture Mirror API"
    APP_ENV: str = Field(default="development", description="Environment: development, test, staging, production")
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    # Database Settings (PostgreSQL on AWS RDS)
    # If DATABASE_URL is directly provided (e.g. from AWS Secrets Manager), it takes precedence.
    DATABASE_URL: Optional[str] = None
    DB_HOST: str = "dariai-picture-mirror-dev.c7em0as8esn6.ap-south-2.rds.amazonaws.com"
    DB_PORT: int = 5432
    DB_NAME: str = "postgres"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800

    # AWS Settings
    AWS_REGION: str = "ap-south-2"
    S3_BUCKET_NAME: str = "dari-ai-picture-mirror-dev"

    # Security & CORS
    # Accepts comma-separated string (e.g. from env) or list of strings
    CORS_ORIGINS: Union[List[str], str] = []

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Union[List[str], str]) -> List[str]:
        if isinstance(v, str):
            if not v.strip():
                return []
            return [i.strip() for i in v.split(",") if i.strip()]
        if isinstance(v, list):
            return [str(item).strip() for item in v if str(item).strip()]
        return []

    @property
    def sqlalchemy_database_uri(self) -> str:
        """Construct or normalize the SQLAlchemy connection URI."""
        if self.DATABASE_URL:
            raw_url = self.DATABASE_URL.strip()
            # Standardize postgres:// to postgresql+psycopg2:// for SQLAlchemy 2.x
            if raw_url.startswith("postgres://"):
                return raw_url.replace("postgres://", "postgresql+psycopg2://", 1)
            if raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+"):
                return raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return raw_url

        # Build URI from individual components, safely encoding special characters
        encoded_user = quote_plus(self.DB_USER)
        encoded_password = quote_plus(self.DB_PASSWORD) if self.DB_PASSWORD else ""

        if encoded_password:
            user_pass = f"{encoded_user}:{encoded_password}"
        else:
            user_pass = encoded_user

        return f"postgresql+psycopg2://{user_pass}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    def get_safe_database_uri_for_logging(self) -> str:
        """Return the database connection string with password redacted for safe logging."""
        try:
            full_uri = self.sqlalchemy_database_uri
            split = urlsplit(full_uri)
            if split.password:
                safe_netloc = split.netloc.replace(f":{split.password}@", ":***@")
                return urlunsplit((split.scheme, safe_netloc, split.path, split.query, split.fragment))
            return full_uri
        except Exception:
            return "postgresql+psycopg2://***:***@<redacted>"


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings singleton."""
    return Settings()
