"""Main FastAPI application entrypoint for DaRI AI Picture Mirror.

Initializes the application lifecycle, middleware, error handlers, and routers.
Designed for execution on AWS ECS Fargate behind an Application Load Balancer.
"""

from contextlib import asynccontextmanager
import logging
import os
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes.auth import router as auth_router
from app.api.routes.challenges import router as challenges_router
from app.api.routes.health import router as health_router
from app.api.routes.pictures import router as pictures_router
from app.api.routes.players import router as players_router
from app.api.routes.tournaments import router as tournaments_router
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.db.session import engine

# Initialize settings and logging
settings = get_settings()
logger = setup_logging(settings.LOG_LEVEL)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager handling startup and shutdown events."""
    # Startup phase
    logger.info("Starting %s in [%s] environment", settings.APP_NAME, settings.APP_ENV)
    logger.info("Configured target S3 bucket: %s (Region: %s)", settings.S3_BUCKET_NAME, settings.AWS_REGION)
    logger.info("Configured database target: %s", settings.get_safe_database_uri_for_logging())
    logger.info("Swagger documentation available at /docs")

    yield

    # Shutdown phase
    logger.info("Shutting down %s gracefully...", settings.APP_NAME)
    engine.dispose()
    logger.info("Database connection pools closed cleanly.")


def create_application() -> FastAPI:
    """Application factory for DaRI AI Picture Mirror backend."""
    app = FastAPI(
        title=settings.APP_NAME,
        description=(
            "Production-ready FastAPI backend skeleton for DaRI AI Picture Mirror. "
            "Integrates with AWS ECS Fargate, private RDS PostgreSQL, and private Amazon S3."
        ),
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # CORS Middleware configuration
    # Restricts origins to configured domain list; does not default to open wildcard in production
    if settings.CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.CORS_ORIGINS,
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allow_headers=["*"],
        )
    else:
        # Default local development fallback if no origins explicitly provided
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:3000", "http://localhost:8000"],
            allow_credentials=True,
            allow_methods=["GET", "POST", "OPTIONS"],
            allow_headers=["*"],
        )

    # Global Exception Handler to prevent leakage of internal tracebacks or secrets
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error(
            "Unhandled server exception on %s %s: %s",
            request.method,
            request.url.path,
            type(exc).__name__,
            exc_info=True,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )

    # Register API routers
    app.include_router(health_router)
    app.include_router(challenges_router)
    app.include_router(pictures_router)
    app.include_router(auth_router)
    app.include_router(players_router)
    app.include_router(tournaments_router)

    # Mount static files for the Arcade Web App
    # Resolves www relative to project root
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    www_dir = os.path.join(base_dir, "www")
    if os.path.exists(www_dir):
        app.mount("/", StaticFiles(directory=www_dir, html=True), name="static")
        logger.info("Mounted static web arcade from %s to /", www_dir)
    else:
        logger.warning("Static www directory not found at %s", www_dir)

    return app


app = create_application()
