"""Security helpers: bcrypt verify + JWT round-trip."""
from __future__ import annotations

import os

os.environ.setdefault("SUPABASE_DB_URL", "postgresql+asyncpg://x:y@localhost/x")
os.environ.setdefault("ANTHROPIC_API_KEY", "sk-test")
os.environ.setdefault("APP_PASSWORD_HASH", "$2b$12$abcdefghijklmnopqrstuv")
os.environ.setdefault("JWT_SECRET", "test-secret")

from passlib.hash import bcrypt  # noqa: E402

from app.config import Settings  # noqa: E402
from app.core.security import (  # noqa: E402
    create_session_token,
    decode_session_token,
    verify_password,
)


def _settings() -> Settings:
    return Settings(
        supabase_db_url="postgresql+asyncpg://x:y@localhost/x",
        anthropic_api_key="sk-test",
        app_password_hash=bcrypt.hash("correct horse battery staple"),
        jwt_secret="test-secret",
    )


def test_verify_password_accepts_correct_and_rejects_wrong():
    settings = _settings()
    assert verify_password("correct horse battery staple", settings.app_password_hash) is True
    assert verify_password("wrong", settings.app_password_hash) is False


def test_jwt_round_trip():
    settings = _settings()
    token = create_session_token(settings)
    payload = decode_session_token(settings, token)
    assert payload is not None
    assert payload["sub"] == "owner"


def test_jwt_rejects_tampered_token():
    settings = _settings()
    token = create_session_token(settings) + "x"
    assert decode_session_token(settings, token) is None
