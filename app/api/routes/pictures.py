"""Picture API routes for DaRI AI Picture Mirror.

Contains initial placeholder endpoints for picture listing and future operations.
Image-processing and AI generation logic are explicitly marked as pending
final business requirements.
"""

import logging
from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.picture import PictureCreatePlaceholder, PictureListResponse
from app.services.picture_service import PictureService
from app.services.s3_service import S3Service, get_s3_service

logger = logging.getLogger("dariai_picture_mirror.pictures_api")

router = APIRouter(prefix="/api/v1/pictures", tags=["Pictures (Placeholder)"])


def get_picture_service(
    db: Session = Depends(get_db),
    s3_service: S3Service = Depends(get_s3_service),
) -> PictureService:
    """Dependency that creates and provides PictureService."""
    return PictureService(db=db, s3_service=s3_service)


@router.get(
    "",
    response_model=PictureListResponse,
    summary="List Pictures (Placeholder)",
    description=(
        "Returns a documented empty list of pictures. "
        "Awaiting concrete picture data model, generative pipeline specifications, "
        "and user association requirements."
    ),
)
def list_pictures(
    service: PictureService = Depends(get_picture_service),
) -> PictureListResponse:
    """Return placeholder empty list of pictures."""
    items = service.list_pictures()
    return PictureListResponse(
        items=items,
        total=len(items),
        note="Placeholder: Picture schema and processing pipeline will be implemented upon requirement finalization.",
    )


@router.post(
    "/process",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Request Picture Processing (Placeholder)",
    description=(
        "Stub endpoint acknowledging a picture processing/mirroring request. "
        "Actual generative AI / transformation pipeline is not yet implemented."
    ),
)
def process_picture_placeholder(
    payload: PictureCreatePlaceholder,
    service: PictureService = Depends(get_picture_service),
) -> Dict[str, Any]:
    """Stub endpoint for requesting future picture processing."""
    return service.request_picture_processing(payload)
