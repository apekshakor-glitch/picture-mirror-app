"""Database engine, session management, and connectivity verification."""

import logging
from typing import Generator, Optional, Tuple

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

logger = logging.getLogger("dariai_picture_mirror.db")
settings = get_settings()

# Engine creation:
# - pool_pre_ping=True tests connections prior to checkout to discard stale connections
# - connect_timeout limits connection attempts so health checks don't hang indefinitely
engine = create_engine(
    settings.sqlalchemy_database_uri,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=True,
    connect_args={"connect_timeout": 5},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a managed SQLAlchemy database session.

    Ensures the session is always closed after request processing.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_readiness() -> Tuple[bool, Optional[str]]:
    """Perform a lightweight database readiness probe (`SELECT 1`).

    Returns:
        (True, None) if the database is reachable and responsive.
        (False, error_detail) with a sanitized message if unreachable.
    Never exposes passwords, internal IP addresses, or raw tracebacks to callers.
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True, None
    except SQLAlchemyError as exc:
        # Log safe error without exposing connection secrets
        logger.warning("Database connectivity check failed: %s", type(exc).__name__)
        return False, "Database connection unavailable"
    except Exception as exc:
        logger.error("Unexpected error during database check: %s", type(exc).__name__)
        return False, "Database check failed"
