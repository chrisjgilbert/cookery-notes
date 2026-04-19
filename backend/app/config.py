from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    env: str = "dev"
    supabase_db_url: str
    alembic_db_url: str | None = None
    anthropic_api_key: str
    app_password_hash: str
    jwt_secret: str
    jwt_exp_seconds: int = 60 * 60 * 24 * 14
    frontend_origin: str = "http://localhost:3000"
    jina_reader_base: str = "https://r.jina.ai"
    log_level: str = "INFO"

    @property
    def is_prod(self) -> bool:
        return self.env.lower() == "prod"


@lru_cache
def get_settings() -> Settings:
    return Settings()
