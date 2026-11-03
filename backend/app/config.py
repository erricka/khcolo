from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Runtime configuration. Every value can be set through an environment variable
    of the same name (case-insensitive) or a backend/.env file."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = "development"
    database_url: str = "postgresql+psycopg://khcolo:khcolo-dev-only@127.0.0.1:5432/khcolo"
    content_dir: Path = REPO_ROOT / "content"

    # Admin API. Leave unset to disable every /admin endpoint.
    admin_api_token: str | None = None

    # When set, every /api request (except the health check) must carry this value in
    # X-Internal-Key. Use it whenever the API has a public URL but only the website
    # should call it (e.g. Render web services).
    internal_api_key: str | None = None

    # Comma-separated list. Only needed if the browser calls the API cross-origin;
    # the Next.js site proxies /api/v1 so production normally leaves this empty.
    cors_origins: str = ""

    # Read the client IP from X-Forwarded-For. Enable only behind a proxy you control.
    trust_proxy_headers: bool = False
    ip_hash_salt: str = "dev-salt-change-me"

    inquiry_rate_limit: int = 5
    inquiry_rate_window_minutes: int = 10
    inquiry_global_hourly_limit: int = 120

    # Optional inquiry notifications. Each channel is skipped unless fully configured.
    telegram_bot_token: str | None = None
    telegram_chat_id: str | None = None
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from: str | None = None
    notify_email_to: str | None = None

    # On-demand revalidation of the Next.js site after content edits.
    frontend_revalidate_url: str | None = None
    revalidate_secret: str | None = None

    @field_validator("database_url")
    @classmethod
    def use_psycopg_driver(cls, v: str) -> str:
        # Hosting platforms (Render, Heroku) hand out postgres:// or postgresql:// URLs.
        for prefix in ("postgres://", "postgresql://"):
            if v.startswith(prefix):
                return "postgresql+psycopg://" + v[len(prefix):]
        return v

    @field_validator("frontend_revalidate_url")
    @classmethod
    def full_revalidate_url(cls, v: str | None) -> str | None:
        # Render's private network gives a bare "host:port"; expand it to the webhook URL.
        if v and "://" not in v:
            return f"http://{v}/api/revalidate/"
        return v or None

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
