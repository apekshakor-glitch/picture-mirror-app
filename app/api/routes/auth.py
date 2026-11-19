"""FastAPI Router for Authentication and Admin Key Management.

Matches the exact contract expected by www/app.js.
"""

from datetime import datetime, timezone
import json
import os
import random
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.app_setting import AppSetting
from app.models.player import Player
from app.services.auth_service import (
    authenticate_google_user,
    register_player,
    get_player_by_email,
    save_api_key,
    get_api_key,
    clear_api_key,
)

router = APIRouter(prefix="/api", tags=["Authentication & Admin Keys"])

# In-memory temporary store for email verification codes: email -> {"code": str, "expires": float}
verification_codes: Dict[str, Dict[str, Any]] = {}


# --- Pydantic Schemas matching frontend payloads ---

class GoogleAuthRequest(BaseModel):
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    sub: Optional[str] = None


class GoogleConfigSaveRequest(BaseModel):
    clientId: str


class SignupRequest(BaseModel):
    name: str
    email: str
    role: str = "participant"
    googleId: Optional[str] = None
    avatar: Optional[str] = None
    deviceToken: Optional[str] = None
    openai_api_key: Optional[str] = None


class CheckEmailRequest(BaseModel):
    email: str


class AuthLoginRequest(BaseModel):
    email: Optional[str] = None
    id: Optional[str] = None


class SendVerificationRequest(BaseModel):
    email: str


class VerifyCodeRequest(BaseModel):
    email: str
    code: str


class SaveKeyRequest(BaseModel):
    api_key: str
    admin_player_id: Optional[str] = None


# --- Endpoints ---

@router.get("/auth/google/config")
def get_google_config(db: Session = Depends(get_db)):
    """Returns the configured Google OAuth 2.0 Client ID."""
    client_id = ""

    # 1. Database app_settings
    setting = db.get(AppSetting, "google_client_id")
    if setting and setting.value:
        client_id = setting.value.strip()

    # 2. Environment variable
    if not client_id or "YOUR_GOOGLE_CLIENT_ID_HERE" in client_id:
        client_id = os.environ.get("GOOGLE_CLIENT_ID", "").strip()

    # 3. Local google-auth-config.json
    if not client_id or "YOUR_GOOGLE_CLIENT_ID_HERE" in client_id:
        config_file = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
            "google-auth-config.json",
        )
        if os.path.exists(config_file):
            try:
                with open(config_file, "r", encoding="utf-8") as f:
                    cfg = json.load(f)
                    val = (cfg.get("client_id") or "").strip()
                    if val and "YOUR_GOOGLE_CLIENT_ID_HERE" not in val:
                        client_id = val
            except Exception:
                pass

    return {"ok": True, "clientId": client_id}


@router.post("/auth/google/config")
def save_google_config(payload: GoogleConfigSaveRequest, db: Session = Depends(get_db)):
    """Saves the Google OAuth 2.0 Client ID to system settings."""
    cid = payload.clientId.strip()
    setting = db.get(AppSetting, "google_client_id")
    if not setting:
        setting = AppSetting(key="google_client_id", value=cid, is_secret=False)
        db.add(setting)
    else:
        setting.value = cid
    db.commit()

    # Also sync to google-auth-config.json if possible
    config_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
        "google-auth-config.json",
    )
    try:
        with open(config_file, "w", encoding="utf-8") as f:
            json.dump({
                "client_id": cid,
                "_instructions": "Replace client_id with your Google Cloud Console OAuth 2.0 Client ID."
            }, f, indent=2)
    except Exception:
        pass

    return {"ok": True, "clientId": cid}


@router.post("/auth/google")
def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Google Authentication endpoint:
    - If email exists in database -> returns player and logs straight into arcade (isNew: false).
    - If new email -> returns isNew: true and googleUser so frontend prompts for role confirmation.
    """
    clean_email = (payload.email or "").strip().lower()
    if not clean_email or "@" not in clean_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A valid Google email address is required.")

    # 1. Check existing player by email or google_id
    player = get_player_by_email(db, clean_email)
    if not player and payload.sub:
        player = db.query(Player).filter(Player.google_id == payload.sub).first()

    if player:
        # Existing user -> Update profile info and last active time
        if payload.sub and not player.google_id:
            player.google_id = payload.sub
        if payload.picture and not player.avatar_url:
            player.avatar_url = payload.picture
        if payload.name and not player.name:
            player.name = payload.name
        player.last_active_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(player)

        return {
            "ok": True,
            "isNew": False,
            "player": player.to_dict(),
            "message": f"Welcome back, {player.name}!",
        }

    # 2. First-time Google user -> Prompt for role onboarding
    return {
        "ok": True,
        "isNew": True,
        "googleUser": {
            "name": payload.name or clean_email.split("@")[0].title(),
            "email": clean_email,
            "googleId": payload.sub or f"G-{int(datetime.now().timestamp() * 1000)}",
            "avatar": payload.picture or "",
        },
        "message": "First-time Google user. Please confirm role to complete signup.",
    }


@router.post("/auth/login")
def auth_login(payload: AuthLoginRequest, db: Session = Depends(get_db)):
    """Log in using email, player ID (e.g. 'P1234'), or player name."""
    player = None
    if payload.email:
        player = get_player_by_email(db, payload.email.strip().lower())
    if not player and payload.id:
        query_id = payload.id.strip()
        player = db.get(Player, query_id) or db.get(Player, query_id.upper())
        if not player:
            player = db.query(Player).filter(Player.name.ilike(query_id)).first()

    if not player:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"ok": False, "notFound": True, "error": "No account found. Please sign up first."}
        )

    player.last_active_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(player)

    return {"ok": True, "player": player.to_dict()}


@router.post("/auth/check-email")
def check_email(payload: CheckEmailRequest, db: Session = Depends(get_db)):
    """Checks whether an email already exists in the database."""
    player = get_player_by_email(db, payload.email)
    return {
        "ok": True,
        "exists": player is not None,
        "player": player.to_dict() if player else None,
    }


@router.post("/auth/signup")
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """
    Registers a new player with specific role ('admin' | 'participant').
    If role is 'admin', securely stores the OpenAI API Key in the database.
    """
    result = register_player(
        db=db,
        name=payload.name,
        email=payload.email,
        role=payload.role,
        google_id=payload.googleId,
        avatar_url=payload.avatar,
        device_token=payload.deviceToken,
        openai_api_key=payload.openai_api_key,
    )
    if not result.get("ok"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT if "already exists" in result.get("error", "") else status.HTTP_400_BAD_REQUEST,
            detail=result.get("error"),
        )
    return result


@router.post("/auth/send-verification")
def send_verification(payload: SendVerificationRequest):
    """Generates an email verification code."""
    email = payload.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    code = str(random.randint(100000, 999999))
    verification_codes[email] = {
        "code": code,
        "expires": datetime.now().timestamp() + 600,
    }
    return {
        "ok": True,
        "code": code,
        "message": f"Verification code generated for {email}",
    }


@router.post("/auth/verify-code")
def verify_code(payload: VerifyCodeRequest):
    """Verifies a 6-digit email confirmation code."""
    email = payload.email.strip().lower()
    code = payload.code.strip()
    record = verification_codes.get(email)
    if not record:
        raise HTTPException(status_code=400, detail="No verification code found. Please request a new code.")
    if datetime.now().timestamp() > record["expires"]:
        verification_codes.pop(email, None)
        raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new code.")
    if record["code"] != code:
        raise HTTPException(status_code=400, detail="Invalid verification code. Please check and try again.")
    return {"ok": True, "verified": True}


@router.get("/key")
def get_key(db: Session = Depends(get_db)):
    """Retrieves whether an OpenAI API Key exists in the database for the application."""
    return get_api_key(db)


@router.post("/key")
def store_key(payload: SaveKeyRequest, db: Session = Depends(get_db)):
    """Stores the OpenAI API Key in the database (restricted to admin)."""
    result = save_api_key(
        db=db,
        api_key=payload.api_key,
        admin_player_id=payload.admin_player_id,
    )
    if not result.get("ok"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN if "Permission denied" in result.get("error", "") else status.HTTP_400_BAD_REQUEST,
            detail=result.get("error"),
        )
    return result


@router.post("/key/clear")
def clear_key_endpoint(admin_player_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Clears the stored OpenAI API Key from the database."""
    return clear_api_key(db=db, admin_player_id=admin_player_id)
