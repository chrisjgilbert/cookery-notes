from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.config import Settings, get_settings
from app.core.security import (
    SESSION_COOKIE_NAME,
    cookie_kwargs,
    create_session_token,
    verify_password,
)
from app.schemas.auth import LoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(
    body: LoginRequest,
    response: Response,
    settings: Settings = Depends(get_settings),
) -> dict[str, bool]:
    if not verify_password(body.password, settings.app_password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid password")

    token = create_session_token(settings)
    response.set_cookie(
        value=token,
        max_age=settings.jwt_exp_seconds,
        **cookie_kwargs(settings),
    )
    return {"ok": True}


@router.post("/logout")
async def logout(
    response: Response,
    settings: Settings = Depends(get_settings),
) -> dict[str, bool]:
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/")
    return {"ok": True}
