"""Targeted reconciliation of reviewed content into PostgreSQL.

    python -m app.reconcile            # dry run: print every field that differs, change nothing
    python -m app.reconcile --apply    # apply exactly those changes in one transaction

Unlike `app.seed --overwrite`, this touches only the rows listed below and only the fields an
editor approved in the 4 Nov 2026 legal recheck. Everything else in the database (inquiries,
other editors' work, media) is left alone. Back up the database before running with --apply,
then revalidate the website (POST /api/v1/admin/revalidate) and compare the API-backed output.
"""

import argparse
import json
from datetime import date
from pathlib import Path

from sqlalchemy import select

from . import models, schemas
from .config import get_settings
from .db import SessionLocal

# The reviewed scope. Keep in step with content/publication.json.
PAGES = ["/", "/about-us/", "/contact-us/", "/privacy-policy/", "/products/"]
COMPANY_FIELDS = ["tagline", "positioning", "description", "serviceAreas", "partners", "principles",
                  "solutionGroups", "knowsAbout", "updatedAt"]


def _load(content_dir: Path, name: str):
    return json.loads((content_dir / name).read_text(encoding="utf-8"))


def plan(db, content_dir: Path) -> list[tuple[str, str, object, object, callable]]:
    """Return (row, field, current, approved, setter) for every difference."""
    changes = []

    def diff(label, field, current, approved, setter):
        if current != approved:
            changes.append((label, field, current, approved, setter))

    pub = _load(content_dir, "publication.json")
    company = _load(content_dir, "company.json")
    setting = db.scalar(select(models.SiteSetting).where(models.SiteSetting.key == "company"))
    if setting is not None:
        value = dict(setting.value)
        for f in COMPANY_FIELDS:
            def set_company(v, f=f):
                setting.value = {**setting.value, f: v}
            diff("settings:company", f, value.get(f), company.get(f), set_company)

    pages = {p["path"]: p for p in _load(content_dir, "pages.json")}
    for path in PAGES:
        row = db.scalar(select(models.PageSeo).where(models.PageSeo.path == path))
        if row is None or path not in pages:
            continue
        p = pages[path]
        for attr, key in [("title", "title"), ("description", "description"), ("h1", "h1"), ("indexable", "indexable")]:
            diff(f"page:{path}", attr, getattr(row, attr), p[key], lambda v, r=row, a=attr: setattr(r, a, v))

    services = {s["slug"]: s for s in _load(content_dir, "services.json")}
    for row in db.scalars(select(models.Service)):
        public = row.slug in pub["publicServices"]
        diff(f"service:{row.slug}", "is_published", row.is_published, public,
             lambda v, r=row: setattr(r, "is_published", v))
        if public and row.slug in services:
            s = services[row.slug]
            body = schemas.ServiceBody.model_validate(s).model_dump(by_alias=True)
            for attr, approved in [("name", s["name"]), ("short_name", s["shortName"]), ("summary", s["summary"]),
                                   ("h1", s["h1"]), ("intro", s["intro"]), ("seo_title", s["seo"]["title"]),
                                   ("seo_description", s["seo"]["description"]), ("body", body)]:
                diff(f"service:{row.slug}", attr, getattr(row, attr), approved,
                     lambda v, r=row, a=attr: setattr(r, a, v))

    for model, label in [(models.ProductCategory, "category"), (models.Product, "product")]:
        for row in db.scalars(select(model)):
            diff(f"{label}:{row.slug}", "is_published", row.is_published, bool(pub["productsPublic"]),
                 lambda v, r=row: setattr(r, "is_published", v))

    # Redirects into archived content become 410 Gone, as the website already answers.
    hidden = {f"/{slug}/" for slug in services if slug not in pub["publicServices"]} | set(pub["gonePaths"])
    for row in db.scalars(select(models.Redirect)):
        if row.status_code != 410 and (row.destination in hidden or row.source in hidden
                                       or (not pub["productsPublic"] and (row.destination or "").startswith("/product"))):
            def gone(_v, r=row):
                r.destination, r.status_code = None, 410
            diff(f"redirect:{row.source}", "status_code", row.status_code, 410, gone)
    return changes


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--apply", action="store_true", help="write the changes (default is a dry run)")
    parser.add_argument("--content-dir", type=Path, default=None)
    args = parser.parse_args()
    content_dir = args.content_dir or get_settings().content_dir

    with SessionLocal() as db:
        changes = plan(db, content_dir)
        for label, field, current, approved, _ in changes:
            short = lambda v: (json.dumps(v, ensure_ascii=False, default=str)[:140])  # noqa: E731
            print(f"{label:48} {field:16} {short(current)}\n{'':65}-> {short(approved)}")
        print(f"\n{len(changes)} field(s) differ from the approved copy.")
        if not args.apply:
            print("Dry run: nothing changed. Re-run with --apply after a database backup.")
            return
        for label, field, current, approved, setter in changes:
            setter(approved)
        db.commit()
        print(f"Applied {len(changes)} change(s) on {date.today().isoformat()}.")


if __name__ == "__main__":
    main()
