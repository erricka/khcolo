"""Targeted reconciliation: dry run reports differences, --apply fixes only those rows.

Runs after test_api.py (alphabetical), because applying it unpublishes archived content.
"""

from sqlalchemy import select

from app import models
from app.config import get_settings
from app.db import SessionLocal
from app.reconcile import plan


def test_reconcile_dry_run_then_apply(client):
    content_dir = get_settings().content_dir
    with SessionLocal() as db:
        setting = db.scalar(select(models.SiteSetting).where(models.SiteSetting.key == "company"))
        setting.value = {**setting.value, "tagline": "Stale tagline", "partners": [{"vendor": "X", "relationship": "Gold Partner", "scope": "s"}]}
        inquiries_before = db.query(models.Inquiry).count()
        db.commit()

    with SessionLocal() as db:
        changes = plan(db, content_dir)
        fields = {(label, field) for label, field, *_ in changes}
        assert ("settings:company", "tagline") in fields
        assert ("settings:company", "partners") in fields
        assert ("service:it-maintenance", "is_published") in fields   # archived service still published
        db.rollback()                                                    # a dry run changes nothing
    assert "Stale tagline" in client.get("/api/v1/site").text

    with SessionLocal() as db:
        for *_, approved, setter in plan(db, content_dir):
            setter(approved)
        db.commit()
    with SessionLocal() as db:
        assert plan(db, content_dir) == []
        assert db.query(models.Inquiry).count() == inquiries_before    # inquiries untouched

    slugs = {s["slug"] for s in client.get("/api/v1/services").json()}
    assert slugs == {"cloud-call-center", "3cx-bitrix24-integration"}
    assert "Gold Partner" not in client.get("/api/v1/site").text


def test_run_logs_full_old_value_before_applying(client, capsys, monkeypatch):
    """The KH_RECONCILE hook in app.seed: the log line keeps the old value, then the row is fixed."""
    from app import seed as seed_module

    with SessionLocal() as db:
        setting = db.scalar(select(models.SiteSetting).where(models.SiteSetting.key == "company"))
        setting.value = {**setting.value, "tagline": "Stale again"}
        db.commit()

    monkeypatch.setenv("KH_RECONCILE", "dry-run")
    monkeypatch.setattr("sys.argv", ["app.seed"])
    seed_module.main()
    assert "Dry run: nothing changed" in capsys.readouterr().out
    assert "Stale again" in client.get("/api/v1/site").text

    monkeypatch.setenv("KH_RECONCILE", "apply")
    seed_module.main()
    out = capsys.readouterr().out
    backup = [line for line in out.splitlines() if line.startswith("RECONCILE-BACKUP ")]
    assert len(backup) == 1 and '"value": "Stale again"' in backup[0]
    assert "Applied 1 change(s)" in out
    assert "Stale again" not in client.get("/api/v1/site").text
