"""Application settings model for storing configuration keys (e.g. OpenAI API Key) in PostgreSQL."""

from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, utc_now

if TYPE_CHECKING:
    from app.models.player import Player


class AppSetting(Base):
    """
    Stores system-wide configuration keys (such as the OpenAI API key or Google Client ID).
    Editable by players with the 'admin' role.
    """
    __tablename__ = "app_settings"

    key: Mapped[str] = mapped_column(
        String(64),
        primary_key=True,
    )
    value: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    is_secret: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    updated_by_player_id: Mapped[Optional[str]] = mapped_column(
        String(64),
        ForeignKey("players.id", ondelete="SET NULL"),
        nullable=True,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    # Relationships
    updated_by_player: Mapped[Optional["Player"]] = relationship(
        "Player",
        back_populates="settings_updated",
    )

    def __repr__(self) -> str:
        return f"<AppSetting key='{self.key}' is_secret={self.is_secret}>"

