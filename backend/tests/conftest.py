import os

# Point the app at the test database before anything imports app.config.
os.environ.setdefault(
    "DATABASE_URL", "postgresql+psycopg://khcolo:khcolo-dev-only@127.0.0.1:5432/khcolo_test"
)
os.environ["ADMIN_API_TOKEN"] = "test-admin-token"
os.environ["TELEGRAM_BOT_TOKEN"] = ""
os.environ["SMTP_HOST"] = ""

from pathlib import Path  # noqa: E402

import pytest  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.config import get_settings  # noqa: E402
from app.db import engine  # noqa: E402
from app.main import app  # noqa: E402
from app.seed import seed  # noqa: E402

BACKEND = Path(__file__).resolve().parents[1]


@pytest.fixture(scope="session", autouse=True)
def database():
    assert "_test" in engine.url.database, "tests must run against a *_test database"
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE; CREATE SCHEMA public;"))
    cfg = Config(str(BACKEND / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND / "alembic"))
    command.upgrade(cfg, "head")
    seed(get_settings().content_dir, overwrite=True)
    yield


@pytest.fixture(autouse=True)
def clean_inquiries():
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE inquiries"))
    yield


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def admin_headers():
    return {"Authorization": "Bearer test-admin-token"}


@pytest.fixture
def valid_inquiry():
    return {
        "name": "Sokha Chan",
        "company": "Example Trading Co.",
        "email": "sokha@example.com",
        "phone": "+855 12 000 000",
        "preferredContact": "email",
        "requestType": "consultation",
        "interest": "cloud-call-center",
        "message": "We have 20 staff and want to move our phones to 3CX.",
        "consent": True,
        "sourcePath": "/contact-us/",
        "website": "",
    }
