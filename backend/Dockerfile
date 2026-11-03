# FastAPI service. Build context is the repository root:
#   docker build -f backend/Dockerfile -t khcolo-api .
#
# On start it applies migrations and inserts any missing seed content (rows that
# were edited through the admin API are left alone), then serves on :8000.

FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    CONTENT_DIR=/app/content
WORKDIR /app/backend

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .
COPY content /app/content

RUN useradd --create-home --uid 10001 app && chown -R app /app
USER app

EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && python -m app.seed && exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]
