"""Pydantic schemas for API health, readiness, and root endpoints."""

from typing import Optional
from pydantic import BaseModel, Field


class RootResponse(BaseModel):
    """Response schema for the root endpoint GET /."""

    message: str = Field(..., examples=["DaRI AI Picture Mirror API is running"])
    environment: str = Field(..., examples=["development"])
    version: str = Field(..., examples=["0.1.0"])


class HealthResponse(BaseModel):
    """Response schema for the basic liveness check GET /health.

    Does not expose secrets, credentials, or internal hostnames.
    """

    status: str = Field(default="ok", examples=["ok"])
    environment: str = Field(..., examples=["development"])


class ReadinessResponse(BaseModel):
    """Response schema for database readiness probe GET /health/ready."""

    status: str = Field(..., examples=["ready"])
    database: str = Field(..., examples=["connected"])
    detail: Optional[str] = Field(default=None, examples=["Database connection verified"])


class S3HealthResponse(BaseModel):
    """Response schema for S3 bucket connectivity check GET /health/s3."""

    status: str = Field(..., examples=["ready"])
    s3: str = Field(..., examples=["accessible"])
    bucket: str = Field(..., examples=["dari-ai-picture-mirror-dev"])
    detail: Optional[str] = Field(default=None, examples=["S3 bucket accessible"])
