"""FastAPI Router for Game Challenge Images and S3 24-Hour Lifecycle Management.

Enforces the 24-hour image reuse rule:
- Only the original challenge image is uploaded to S3.
- After 24 hours of being saved, an image becomes eligible for reuse in another challenge.
- If no challenge image saved before 24 hours exists, a fresh image is generated and saved.
"""

import base64
from datetime import datetime, timedelta, timezone
import io
import logging
import random
import struct
import urllib.request
import uuid
import zlib
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.challenge import Challenge
from app.services.s3_service import S3Service, get_s3_service

logger = logging.getLogger("dariai_picture_mirror.challenges")

router = APIRouter(prefix="/api/challenges", tags=["Challenges & S3"])


class ChallengeUploadRequest(BaseModel):
    prompt: str
    image_url: Optional[str] = None
    image_b64: Optional[str] = None
    level: int = 1
    theme: Optional[str] = "general"


def _map_level_to_difficulty(level: int) -> str:
    if level <= 1:
        return "easy"
    elif level == 2:
        return "medium"
    return "hard"


def _generate_fallback_png_bytes(prompt: str) -> bytes:
    """Generate a clean procedural PNG image in pure Python when external image download fails."""
    width, height = 512, 512
    prompt_hash = sum(ord(c) for c in prompt) if prompt else 42
    r_base = (prompt_hash * 37) % 180 + 30
    g_base = (prompt_hash * 67) % 180 + 30
    b_base = (prompt_hash * 97) % 180 + 30

    lines = []
    for y in range(height):
        line = bytearray([0])  # filter byte 0 (None)
        y_ratio = y / height
        for x in range(width):
            x_ratio = x / width
            r = int((r_base * (1 - x_ratio) + 20 * x_ratio)) % 256
            g = int((g_base * (1 - y_ratio) + 40 * y_ratio)) % 256
            b = int((b_base * x_ratio + 60 * (1 - y_ratio))) % 256
            line.extend([r, g, b])
        lines.append(bytes(line))

    raw_data = b"".join(lines)

    def _chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    idat = zlib.compress(raw_data, level=6)

    return b"\x89PNG\r\n\x1a\n" + _chunk(b"IHDR", ihdr) + _chunk(b"IDAT", idat) + _chunk(b"IEND", b"")


def _is_eligible_for_reuse(c: Challenge, cutoff: datetime) -> bool:
    """A challenge image is eligible for reuse ONLY IF:
    1. It is active.
    2. It was created at least 24 hours ago (c.created_at <= cutoff).
    3. It has NOT been used within the last 24 hours (last_used_at is None or last_used_at <= cutoff).
    """
    if not c.is_active:
        return False
    if c.created_at > cutoff:
        return False
    if c.metadata_json and isinstance(c.metadata_json, dict):
        last_used_str = c.metadata_json.get("last_used_at")
        if last_used_str:
            try:
                last_used_dt = datetime.fromisoformat(last_used_str)
                if last_used_dt > cutoff:
                    return False
            except Exception:
                pass
    return True


@router.get("/next")
def get_next_challenge(
    level: int = Query(1, ge=1, le=5),
    db: Session = Depends(get_db),
    s3_service: S3Service = Depends(get_s3_service),
) -> Dict[str, Any]:
    """Retrieve an existing challenge image from S3 if NOT used in the last 24 hours.

    Enforces the 24-hour reuse rule:
    - Only images created > 24 hours ago AND not used in the last 24 hours can be reused.
    - If all images were used within the last 24 hours (or none exist), returns reused: false
      so the client generates a fresh challenge image.
    - When an image is reused, it is immediately marked with last_used_at = now to start
      its 24-hour cooldown.
    """
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=24)
    target_difficulty = _map_level_to_difficulty(level)

    # 1. Fetch active challenges created at least 24 hours ago
    candidates = (
        db.query(Challenge)
        .filter(
            Challenge.is_active.is_(True),
            Challenge.created_at <= cutoff,
        )
        .all()
    )

    # 2. Filter to challenges that have NOT been used in the last 24 hours
    eligible_candidates = [c for c in candidates if _is_eligible_for_reuse(c, cutoff)]

    # 3. Prefer matching difficulty if available
    matching_diff = [c for c in eligible_candidates if c.difficulty == target_difficulty]
    selection_pool = matching_diff if matching_diff else eligible_candidates

    if selection_pool:
        candidate = random.choice(selection_pool)

        # Mark as used right now to trigger the 24-hour cooldown
        meta = dict(candidate.metadata_json or {})
        meta["last_used_at"] = now.isoformat()
        meta["use_count"] = meta.get("use_count", 0) + 1
        candidate.metadata_json = meta
        candidate.updated_at = now
        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        prompt_text = candidate.metadata_json.get("prompt") if candidate.metadata_json else candidate.title
        presigned_url = s3_service.generate_presigned_download_url(candidate.reference_image_s3_key)

        logger.info(
            "Reused challenge %s (starts 24h cooldown until %s)",
            candidate.id,
            (now + timedelta(hours=24)).isoformat(),
        )

        return {
            "reused": True,
            "challenge_id": str(candidate.id),
            "image_url": f"/api/challenges/{candidate.id}/image",
            "s3_presigned_url": presigned_url,
            "hidden_prompt": prompt_text,
            "theme": candidate.theme,
            "difficulty": candidate.difficulty,
            "created_at": candidate.created_at.isoformat(),
            "last_used_at": meta.get("last_used_at"),
            "message": "Reusing challenge image not used in the last 24 hours. Cooldown started.",
        }

    # No images eligible (all saved images were used in the last 24 hours, or none exist)
    return {
        "reused": False,
        "message": "No challenge images saved before 24 hours (or all used in last 24h). Generate new challenge image.",
    }


@router.post("/upload", status_code=status.HTTP_201_CREATED)
def upload_challenge_image(
    payload: ChallengeUploadRequest,
    db: Session = Depends(get_db),
    s3_service: S3Service = Depends(get_s3_service),
) -> Dict[str, Any]:
    """Upload a newly generated challenge image to private S3 and index in database.

    The saved image will become eligible for challenge reuse after 24 hours.
    """
    clean_prompt = payload.prompt.strip()
    if not clean_prompt:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Challenge prompt is required.")

    image_bytes: Optional[bytes] = None
    content_type = "image/png"

    # Decode base64 payload if provided
    if payload.image_b64:
        raw_b64 = payload.image_b64.strip()
        if "," in raw_b64:
            header, raw_b64 = raw_b64.split(",", 1)
            if "image/jpeg" in header or "image/jpg" in header:
                content_type = "image/jpeg"
        try:
            image_bytes = base64.b64decode(raw_b64)
        except Exception as e:
            logger.warning("Invalid base64 payload for '%s': %s; generating procedural PNG", clean_prompt, e)
            image_bytes = _generate_fallback_png_bytes(clean_prompt)
            content_type = "image/png"

    # Fetch from remote image URL (e.g. Pollinations AI, Unsplash, Wikimedia)
    elif payload.image_url:
        target_url = payload.image_url.strip()
        try:
            req = urllib.request.Request(
                target_url,
                headers={"User-Agent": "DaRI-Picture-Mirror/1.0"},
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                image_bytes = response.read()
                resp_content_type = response.headers.get_content_type()
                if resp_content_type in ("image/png", "image/jpeg", "image/webp"):
                    content_type = resp_content_type
        except Exception as e:
            logger.warning("Could not download image from URL %s: %s; generating procedural PNG", target_url, e)
            image_bytes = _generate_fallback_png_bytes(clean_prompt)
            content_type = "image/png"

    if not image_bytes or len(image_bytes) < 100:
        logger.warning("No valid image bytes for '%s'; generating procedural PNG", clean_prompt)
        image_bytes = _generate_fallback_png_bytes(clean_prompt)
        content_type = "image/png"

    # Upload binary image to private S3 bucket
    challenge_id = uuid.uuid4()
    extension = "jpg" if content_type == "image/jpeg" else "png"
    s3_key = f"challenges/{challenge_id}.{extension}"

    try:
        s3_service.upload_bytes(s3_key, image_bytes, content_type=content_type)
    except Exception as s3_err:
        logger.error("S3 upload failed for challenge %s: %s", challenge_id, s3_err)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to upload image to S3.")

    # Record in database
    difficulty = _map_level_to_difficulty(payload.level)
    now = datetime.now(timezone.utc)
    challenge = Challenge(
        id=challenge_id,
        theme=payload.theme or "general",
        difficulty=difficulty,
        title=clean_prompt[:128],
        reference_image_s3_key=s3_key,
        metadata_json={
            "prompt": clean_prompt,
            "level": payload.level,
            "content_type": content_type,
            "byte_size": len(image_bytes),
            "last_used_at": now.isoformat(),
            "use_count": 1,
        },
        is_active=True,
        created_at=now,
        updated_at=now,
    )

    db.add(challenge)
    db.commit()
    db.refresh(challenge)

    logger.info("Saved challenge %s to S3 (%s). Eligible for reuse after 24h.", challenge_id, s3_key)

    return {
        "ok": True,
        "challenge_id": str(challenge.id),
        "s3_key": s3_key,
        "image_url": f"/api/challenges/{challenge.id}/image",
        "created_at": challenge.created_at.isoformat(),
        "eligible_for_reuse_after": (now + timedelta(hours=24)).isoformat(),
        "message": "Challenge image uploaded to S3. It will be eligible for reuse after 24 hours.",
    }


@router.get("/{challenge_id}/image")
def get_challenge_image(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
    s3_service: S3Service = Depends(get_s3_service),
):
    """Serve the challenge image bytes from private S3 with cache control."""
    challenge = db.get(Challenge, challenge_id)
    if not challenge or not challenge.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge image not found.")

    try:
        image_bytes, content_type = s3_service.get_object_bytes(challenge.reference_image_s3_key)
        return Response(
            content=image_bytes,
            media_type=content_type,
            headers={
                "Cache-Control": "public, max-age=86400",
                "Content-Disposition": f"inline; filename={challenge_id}.png",
            },
        )
    except Exception as exc:
        logger.error("Failed to fetch image from S3 for challenge %s: %s", challenge_id, exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve image from S3.")


@router.get("")
def list_challenges(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """List stored challenges and their 24-hour reuse eligibility status."""
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=24)

    items = db.query(Challenge).order_by(Challenge.created_at.desc()).limit(limit).all()

    result = []
    for c in items:
        hours_old = max(0.0, (now - c.created_at).total_seconds() / 3600.0)
        
        last_used_str = None
        last_used_dt = None
        if c.metadata_json and isinstance(c.metadata_json, dict):
            last_used_str = c.metadata_json.get("last_used_at")
            if last_used_str:
                try:
                    last_used_dt = datetime.fromisoformat(last_used_str)
                except Exception:
                    pass

        hours_since_last_used = None
        if last_used_dt:
            hours_since_last_used = round(max(0.0, (now - last_used_dt).total_seconds() / 3600.0), 2)

        eligible = _is_eligible_for_reuse(c, cutoff)

        result.append(
            {
                "id": str(c.id),
                "title": c.title,
                "difficulty": c.difficulty,
                "s3_key": c.reference_image_s3_key,
                "created_at": c.created_at.isoformat(),
                "hours_since_creation": round(hours_old, 2),
                "last_used_at": last_used_str,
                "hours_since_last_used": hours_since_last_used,
                "eligible_for_reuse": eligible,
                "image_url": f"/api/challenges/{c.id}/image",
            }
        )

    return {
        "total": len(result),
        "cutoff_24h": cutoff.isoformat(),
        "challenges": result,
    }
