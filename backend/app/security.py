import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .config import Settings, get_settings
from .models import Inquiry

_bearer = HTTPBearer(auto_error=False)


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    settings: Settings = Depends(get_settings),
) -> None:
    """Simple bearer-token guard for the admin API."""
    if not settings.admin_api_token:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Admin API is disabled (ADMIN_API_TOKEN not set).")
    if credentials is None or not secrets.compare_digest(credentials.credentials, settings.admin_api_token):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "Invalid or missing admin token.", headers={"WWW-Authenticate": "Bearer"}
        )


def client_ip(request: Request, settings: Settings) -> str:
    if settings.trust_proxy_headers:
        # Set by the website's server-side inquiry route. Only trusted together with
        # TRUST_PROXY_HEADERS (and, on a public API, the internal key check).
        direct = request.headers.get("x-client-ip")
        if direct:
            return direct.strip()
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()
    return request.client.host if request.client else "unknown"


def hash_ip(ip: str, settings: Settings) -> str:
    return hmac.new(settings.ip_hash_salt.encode(), ip.encode(), hashlib.sha256).hexdigest()


def enforce_inquiry_rate_limit(db: Session, ip_hash: str, settings: Settings) -> None:
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(minutes=settings.inquiry_rate_window_minutes)
    recent_from_client = db.scalar(
        select(func.count()).select_from(Inquiry).where(Inquiry.ip_hash == ip_hash, Inquiry.created_at >= window_start)
    )
    if recent_from_client >= settings.inquiry_rate_limit:
        retry = settings.inquiry_rate_window_minutes * 60
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Too many requests from this connection. Please try again later or contact us on Telegram.",
            headers={"Retry-After": str(retry)},
        )
    recent_total = db.scalar(
        select(func.count()).select_from(Inquiry).where(Inquiry.created_at >= now - timedelta(hours=1))
    )
    if recent_total >= settings.inquiry_global_hourly_limit:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "We're receiving an unusual number of requests. Please try again shortly or contact us on Telegram.",
            headers={"Retry-After": "600"},
        )
