"""API routes package."""

from app.api.routes.health import router as health_router
from app.api.routes.pictures import router as pictures_router

__all__ = ["health_router", "pictures_router"]
