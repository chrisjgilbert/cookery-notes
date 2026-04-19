from fastapi import Cookie, Depends, HTTPException, status

from app.config import Settings, get_settings
from app.core.security import SESSION_COOKIE_NAME, decode_session_token


def get_current_user(
    settings: Settings = Depends(get_settings),
    session: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> str:
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="not authenticated")
    payload = decode_session_token(settings, session)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid session")
    return str(payload["sub"])
