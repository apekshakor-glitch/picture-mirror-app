"""Health and readiness probe routes for DaRI AI Picture Mirror.

Provides endpoints for container orchestrators (AWS ECS Fargate), load balancers,
and external monitoring systems to determine application liveness, database readiness,
and S3 bucket accessibility without leaking internal infrastructure secrets.
"""

import logging
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse

from app.core.config import Settings, get_settings
from app.db.session import check_database_readiness
from app.schemas.health import (
    HealthResponse,
    ReadinessResponse,
    RootResponse,
    S3HealthResponse,
)
from app.services.s3_service import S3Service, get_s3_service

logger = logging.getLogger("dariai_picture_mirror.health")

router = APIRouter(tags=["Health & Diagnostics"])


@router.get(
    "/api",
    response_model=RootResponse,
    summary="Root API Endpoint",
    description="Returns a simple acknowledgment indicating the API server is online.",
)
@router.get(
    "/api/info",
    response_model=RootResponse,
    summary="API Info Endpoint",
    description="Returns a simple acknowledgment indicating the API server is online.",
)
def read_root(settings: Settings = Depends(get_settings)) -> RootResponse:
    """Return application name, environment, and version."""
    return RootResponse(
        message=f"{settings.APP_NAME} is running",
        environment=settings.APP_ENV,
        version="0.1.0",
    )


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Basic Health Check",
    description="Lightweight liveness probe indicating the application process is running and responsive.",
)
def read_health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Return basic health status without exposing sensitive infrastructure details."""
    return HealthResponse(
        status="ok",
        environment=settings.APP_ENV,
    )


@router.get(
    "/health/ready",
    response_model=ReadinessResponse,
    summary="Database Readiness Probe",
    description="Verifies live database connectivity by executing a lightweight query (SELECT 1).",
    responses={
        status.HTTP_200_OK: {"description": "Database connection is healthy"},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"description": "Database is unreachable or degraded"},
    },
)
def read_database_readiness() -> JSONResponse:
    """Check whether PostgreSQL can be reached and queried.

    Returns HTTP 200 if connected, or HTTP 503 if unreachable.
    Never exposes internal hostnames, passwords, or raw driver tracebacks.
    """
    is_ready, detail = check_database_readiness()
    if is_ready:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=ReadinessResponse(
                status="ready",
                database="connected",
                detail="Database connection verified",
            ).model_dump(),
        )
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content=ReadinessResponse(
            status="unhealthy",
            database="unavailable",
            detail=detail or "Database connection failed",
        ).model_dump(),
    )


@router.get(
    "/health/s3",
    response_model=S3HealthResponse,
    summary="S3 Accessibility Probe",
    description="Performs a safe, read-only metadata probe (head_bucket) using AWS credentials or ECS task IAM role.",
    responses={
        status.HTTP_200_OK: {"description": "S3 bucket is reachable and permitted"},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"description": "S3 bucket is unreachable or unauthorized"},
    },
)
def read_s3_health(
    s3_service: S3Service = Depends(get_s3_service),
) -> JSONResponse:
    """Check whether the configured private S3 bucket is accessible.

    Returns HTTP 200 if accessible, or HTTP 503 if unreachable or unauthorized.
    Does not modify any bucket content or disclose AWS secret keys.
    """
    is_accessible, detail = s3_service.check_bucket_accessibility()
    if is_accessible:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=S3HealthResponse(
                status="ready",
                s3="accessible",
                bucket=s3_service.bucket_name,
                detail=detail or "S3 bucket accessible",
            ).model_dump(),
        )
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content=S3HealthResponse(
            status="unhealthy",
            s3="unavailable",
            bucket=s3_service.bucket_name,
            detail=detail or "S3 bucket inaccessible",
        ).model_dump(),
    )
