"""Base declarative and timestamp mixins re-exported for app.models."""

from app.db.base import Base, TimestampMixin, utc_now

__all__ = ["Base", "TimestampMixin", "utc_now"]

