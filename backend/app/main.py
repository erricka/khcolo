import logging
import secrets

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from .config import get_settings
from .db import engine
from .routers import admin, inquiries, public

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

settings = get_settings()
MAX_BODY_BYTES = 32 * 1024

app = FastAPI(
    title="KHCOLO API",
    version="1.0.0",
    description="Content and inquiry API for khcolo.com.",
    docs_url="/api/docs" if settings.environment != "production" else None,
    redoc_url=None,
    openapi_url="/api/openapi.json" if settings.environment != "production" else None,
)

if settings.cors_origin_list:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError):
    """Same shape as FastAPI's default 422, minus the echoed input (which may hold personal data)."""
    detail = [{"loc": e.get("loc"), "msg": e.get("msg"), "type": e.get("type")} for e in exc.errors()]
    return JSONResponse({"detail": detail}, status_code=422)


@app.middleware("http")
async def guard_and_headers(request: Request, call_next):
    key = get_settings().internal_api_key
    if key and request.url.path.startswith("/api/") and request.url.path != "/api/v1/health":
        if not secrets.compare_digest(request.headers.get("x-internal-key", ""), key):
            # Look like nothing is here rather than advertising a locked door.
            return JSONResponse({"detail": "Not Found"}, status_code=404, headers={"X-Robots-Tag": "noindex"})
    if request.method in {"POST", "PUT", "PATCH"}:
        length = request.headers.get("content-length")
        if length and length.isdigit() and int(length) > MAX_BODY_BYTES:
            return JSONResponse({"detail": "Request body too large."}, status_code=413)
    response = await call_next(request)
    # The API is never a search result; keep it out of indexes and sniffing-safe.
    response.headers["X-Robots-Tag"] = "noindex, nofollow"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers.setdefault("Cache-Control", "no-store")
    return response


@app.get("/api/v1/health", tags=["meta"])
def health() -> dict:
    with engine.connect() as conn:
        conn.execute(text("select 1"))
    return {"status": "ok"}


app.include_router(public.router, prefix="/api/v1")
app.include_router(inquiries.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
