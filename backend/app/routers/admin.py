"""Authenticated endpoints for staff: inquiries, content review and light content edits."""

import uuid
from datetime import date

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from ..content import product_public, service_public
from ..db import get_db
from ..notify import trigger_revalidation
from ..security import require_admin

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/inquiries", response_model=schemas.InquiryList)
def list_inquiries(
    response: Response,
    status: schemas.InquiryStatus | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    stmt = select(models.Inquiry)
    count = select(func.count()).select_from(models.Inquiry)
    if status:
        stmt = stmt.where(models.Inquiry.status == status)
        count = count.where(models.Inquiry.status == status)
    rows = db.scalars(stmt.order_by(models.Inquiry.created_at.desc()).limit(limit).offset(offset)).all()
    response.headers["Cache-Control"] = "no-store"
    return schemas.InquiryList(total=db.scalar(count), items=rows)


@router.patch("/inquiries/{inquiry_id}", response_model=schemas.InquiryAdmin)
def update_inquiry(inquiry_id: uuid.UUID, body: schemas.InquiryStatusUpdate, db: Session = Depends(get_db)):
    inq = db.get(models.Inquiry, inquiry_id)
    if inq is None:
        raise HTTPException(404, "Inquiry not found.")
    inq.status = body.status
    db.commit()
    return inq


@router.get("/review", response_model=list[schemas.ReviewItem])
def review_list(include_approved: bool = False, db: Session = Depends(get_db)):
    """Everything that still carries unresolved review notes or a non-approved status."""
    items: list[schemas.ReviewItem] = []
    for s in db.scalars(select(models.SiteSetting)).all():
        items.append(schemas.ReviewItem(kind="setting", key=s.key, name=s.key, review_status=s.review_status,
                                        review_notes=s.review_notes, source_urls=s.value.get("review", {}).get("sourceUrls", []),
                                        is_published=True))
    for s in db.scalars(select(models.Service).order_by(models.Service.position)).all():
        items.append(schemas.ReviewItem(kind="service", key=s.slug, name=s.name, review_status=s.review_status,
                                        review_notes=s.review_notes, source_urls=[s.source_url] if s.source_url else [],
                                        is_published=s.is_published))
    for c in db.scalars(select(models.ProductCategory).order_by(models.ProductCategory.position)).all():
        items.append(schemas.ReviewItem(kind="category", key=c.slug, name=c.name, review_status=c.review_status,
                                        review_notes=c.review_notes, source_urls=[c.source_url] if c.source_url else [],
                                        is_published=c.is_published))
    for p in db.scalars(select(models.Product).order_by(models.Product.category_id, models.Product.position)).all():
        items.append(schemas.ReviewItem(kind="product", key=p.slug, name=p.name, review_status=p.review_status,
                                        review_notes=p.review_notes, source_urls=p.source_urls, is_published=p.is_published))
    if not include_approved:
        items = [i for i in items if i.review_status != "approved" or i.review_notes]
    return items


@router.patch("/services/{slug}", response_model=schemas.ServicePublic)
def update_service(slug: str, body: schemas.ServiceUpdate, background: BackgroundTasks, db: Session = Depends(get_db)):
    s = db.scalar(select(models.Service).where(models.Service.slug == slug))
    if s is None:
        raise HTTPException(404, "Service not found.")
    data = body.model_dump(exclude_unset=True)
    public_change = False
    for field in ("name", "short_name", "summary", "h1", "intro"):
        if field in data:
            setattr(s, field, data[field])
            public_change = True
    if body.seo is not None:
        s.seo_title, s.seo_description = body.seo.title, body.seo.description
        public_change = True
    if body.body is not None:
        s.body = body.body.model_dump(by_alias=True)
        public_change = True
    for field in ("review_status", "review_notes", "is_published"):
        if field in data:
            setattr(s, field, data[field])
    if public_change or "is_published" in data:
        s.content_updated_on = date.today()
    db.commit()
    background.add_task(trigger_revalidation, [f"/{slug}/", "/"])
    return service_public(s)


@router.patch("/products/{slug}", response_model=schemas.ProductPublic)
def update_product(slug: str, body: schemas.ProductUpdate, background: BackgroundTasks, db: Session = Depends(get_db)):
    p = db.scalar(
        select(models.Product)
        .where(models.Product.slug == slug)
        .options(selectinload(models.Product.specs), selectinload(models.Product.category), selectinload(models.Product.image))
    )
    if p is None:
        raise HTTPException(404, "Product not found.")
    data = body.model_dump(exclude_unset=True)
    mapping = {"type": "product_type"}
    public_change = False
    for field in ("name", "model", "variant", "type", "facet", "summary", "key_specs", "accessories", "public_notes"):
        if field in data:
            setattr(p, mapping.get(field, field), data[field])
            public_change = True
    if body.seo is not None:
        p.seo_title, p.seo_description = body.seo.title, body.seo.description
        public_change = True
    if body.specs is not None:
        p.specs.clear()
        db.flush()
        p.specs.extend(models.ProductSpec(position=i, label=r.label, value=r.value) for i, r in enumerate(body.specs))
        public_change = True
    for field in ("review_status", "review_notes", "is_published"):
        if field in data:
            setattr(p, field, data[field])
    if public_change or "is_published" in data:
        p.content_updated_on = date.today()
    db.commit()
    db.refresh(p)
    background.add_task(trigger_revalidation, [f"/product/{slug}/", f"/product-category/{p.category.slug}/", "/products/"])
    return product_public(p)


@router.post("/revalidate")
def revalidate_all() -> dict:
    return {"revalidated": trigger_revalidation([])}
