"""Pydantic schemas for Picture operations (placeholders)."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class PictureBase(BaseModel):
    """Base schema for picture data."""

    filename: str = Field(..., description="Original file name of the picture", examples=["mirror_portrait.jpg"])
    content_type: str = Field(default="image/jpeg", description="MIME type of the picture", examples=["image/jpeg"])
    description: Optional[str] = Field(default=None, description="Optional caption or description")


class PictureCreatePlaceholder(PictureBase):
    """Placeholder schema for requesting picture generation/processing."""

    style_preset: Optional[str] = Field(default="default", description="Preset filter or mirror style")


class PictureResponse(PictureBase):
    """Schema representing a picture record."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    s3_key: str
    file_size_bytes: Optional[int] = None
    status: str = Field(..., description="Processing status: pending, processing, completed, failed")
    created_at: datetime
    updated_at: datetime


class PictureListResponse(BaseModel):
    """Response schema for listing pictures (placeholder)."""

    items: List[PictureResponse] = Field(default_factory=list)
    total: int = Field(default=0)
    note: str = Field(
        default="Placeholder list: awaiting finalized image processing requirements and data model.",
        description="Explains current placeholder status",
    )
