"""Load the content inventory in /content into PostgreSQL.

    python -m app.seed               # insert anything missing, leave edited rows alone
    python -m app.seed --overwrite   # reset every content row to the JSON files and
                                     # unpublish services, categories and products
                                     # that are no longer in them

Setting SEED_OVERWRITE=1 in the environment has the same effect as --overwrite, so a host can
run one syncing deploy without changing its start command. Inquiries are never touched.
"""

import argparse
import json
import os
from datetime import date
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models, schemas
from .config import get_settings
from .db import SessionLocal

def _load(content_dir: Path, name: str):
    return json.loads((content_dir / name).read_text(encoding="utf-8"))


def _upsert(db: Session, model, lookup: dict, values: dict, overwrite: bool) -> tuple[object, bool]:
    row = db.scalar(select(model).filter_by(**lookup))
    if row is None:
        row = model(**lookup, **values)
        db.add(row)
        return row, True
    if overwrite:
        for k, v in values.items():
            setattr(row, k, v)
    return row, False


def seed(content_dir: Path, overwrite: bool = False) -> dict[str, int]:
    created: dict[str, int] = {}

    def bump(kind: str, was_created: bool):
        created[kind] = created.get(kind, 0) + int(was_created)

    with SessionLocal() as db:
        company = _load(content_dir, "company.json")
        review = company.get("review", {})
        public_company = {k: v for k, v in company.items() if k != "review"}
        _, c = _upsert(db, models.SiteSetting, {"key": "company"}, {
            "value": public_company | {"review": {"sourceUrls": review.get("sourceUrls", [])}},
            "review_status": review.get("status", "needs_review"),
            "review_notes": review.get("notes", []),
        }, overwrite)
        bump("settings", c)

        for s in _load(content_dir, "services.json"):
            body = schemas.ServiceBody.model_validate(s).model_dump(by_alias=True)
            _, c = _upsert(db, models.Service, {"slug": s["slug"]}, {
                "group_key": s["group"], "position": s["position"], "name": s["name"],
                "short_name": s["shortName"], "icon": s["icon"], "summary": s["summary"], "h1": s["h1"],
                "intro": s["intro"], "seo_title": s["seo"]["title"], "seo_description": s["seo"]["description"],
                "body": body, "source_url": s.get("sourceUrl"),
                "review_status": s["review"]["status"], "review_notes": s["review"]["notes"],
                "is_published": True, "content_updated_on": date.fromisoformat(s["updatedAt"]),
            }, overwrite)
            bump("services", c)

        categories: dict[str, models.ProductCategory] = {}
        for cat in _load(content_dir, "categories.json"):
            row, c = _upsert(db, models.ProductCategory, {"slug": cat["slug"]}, {
                "position": cat["position"], "name": cat["name"], "singular": cat["singular"], "h1": cat["h1"],
                "summary": cat["summary"], "intro": cat["intro"], "facet_label": cat["facetLabel"],
                "seo_title": cat["seo"]["title"], "seo_description": cat["seo"]["description"],
                "related_services": cat["relatedServices"], "source_url": cat.get("sourceUrl"),
                "review_status": "needs_review", "review_notes": [], "is_published": True,
                "content_updated_on": date.fromisoformat(cat["updatedAt"]),
            }, overwrite)
            categories[cat["slug"]] = row
            bump("categories", c)
        db.flush()

        for p in _load(content_dir, "products.json"):
            image = None
            if p.get("image"):
                image, c = _upsert(db, models.Media, {"src": p["image"]["src"]}, {
                    "alt": p["image"]["alt"], "width": p["image"]["width"], "height": p["image"]["height"],
                    "source_url": p["image"].get("sourceUrl"), "rights_status": "needs_review",
                }, overwrite)
                bump("media", c)
                db.flush()
            row, c = _upsert(db, models.Product, {"slug": p["slug"]}, {
                "category_id": categories[p["category"]].id, "position": p["position"], "brand": p.get("brand"),
                "series": p.get("series"), "model": p["model"], "name": p["name"], "variant": p.get("variant"),
                "product_type": p["type"], "facet": p["facet"], "summary": p["summary"],
                "key_specs": p["keySpecs"], "accessories": p["accessories"], "public_notes": p["publicNotes"],
                "seo_title": p["seo"]["title"], "seo_description": p["seo"]["description"],
                "source_urls": p["sourceUrls"], "image_id": image.id if image else None,
                "review_status": p["review"]["status"], "review_notes": p["review"]["notes"],
                "is_published": True, "content_updated_on": date.fromisoformat(p["updatedAt"]),
            }, overwrite)
            db.flush()
            if c or overwrite:
                row.specs.clear()
                db.flush()
                row.specs.extend(models.ProductSpec(position=i, label=r["label"], value=r["value"])
                                 for i, r in enumerate(p["specs"]))
            bump("products", c)

        for page in _load(content_dir, "pages.json"):
            _, c = _upsert(db, models.PageSeo, {"path": page["path"]}, {
                "title": page["title"], "description": page["description"], "h1": page["h1"],
                "schema_type": page["schemaType"], "indexable": page["indexable"],
                "source_url": page.get("sourceUrl"), "content_updated_on": date.fromisoformat(page["updatedAt"]),
            }, overwrite)
            bump("pages", c)

        if overwrite:
            # The files are the source of truth: hide anything that was removed from them.
            # Rows are unpublished rather than deleted so inquiries that mention them keep context.
            listed = {
                models.Service: {s["slug"] for s in _load(content_dir, "services.json")},
                models.ProductCategory: set(categories),
                models.Product: {p["slug"] for p in _load(content_dir, "products.json")},
            }
            for model, slugs in listed.items():
                for row in db.scalars(select(model).where(model.is_published.is_(True), model.slug.not_in(slugs))):
                    row.is_published = False
                    created["unpublished"] = created.get("unpublished", 0) + 1

        redirects = _load(content_dir, "redirects.json")
        for r in redirects["redirects"]:
            _, c = _upsert(db, models.Redirect, {"source": r["source"]}, {
                "destination": r["destination"], "status_code": 308 if r.get("permanent", True) else 307,
                "note": r.get("note"),
            }, overwrite)
            bump("redirects", c)
        for g in redirects["gone"]:
            _, c = _upsert(db, models.Redirect, {"source": g["path"]}, {
                "destination": None, "status_code": 410, "note": g.get("note"),
            }, overwrite)
            bump("redirects", c)

        db.commit()
    return created


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--overwrite", action="store_true", help="reset existing content rows to the JSON files")
    parser.add_argument("--content-dir", type=Path, default=None)
    args = parser.parse_args()
    content_dir = args.content_dir or get_settings().content_dir
    overwrite = args.overwrite or os.environ.get("SEED_OVERWRITE", "").strip().lower() in {"1", "true", "yes"}
    result = seed(content_dir, overwrite=overwrite)
    print("Seed complete. New rows:", ", ".join(f"{k}={v}" for k, v in sorted(result.items())) or "none")

    # Targeted reconciliation for hosts without a shell (see app/reconcile.py). Off unless set.
    mode = os.environ.get("KH_RECONCILE", "").strip().lower()
    if mode in {"dry-run", "apply"}:
        from .reconcile import run

        run(apply=mode == "apply", content_dir=content_dir)


if __name__ == "__main__":
    main()
