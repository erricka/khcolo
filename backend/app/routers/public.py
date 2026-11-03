"""Read-only content endpoints used by the website at build and revalidation time."""

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..content import category_counts, category_public, product_public, published_products_query, service_public
from ..db import get_db

router = APIRouter(tags=["content"])

CACHE = "public, max-age=60, stale-while-revalidate=300"


@router.get("/site")
def site(response: Response, db: Session = Depends(get_db)) -> dict:
    """Company details, contact channels, partners and solution groups."""
    row = db.get(models.SiteSetting, "company")
    if row is None:
        raise HTTPException(404, "Site settings have not been seeded.")
    response.headers["Cache-Control"] = CACHE
    return {k: v for k, v in row.value.items() if k != "review"}


@router.get("/services", response_model=list[schemas.ServicePublic])
def list_services(response: Response, db: Session = Depends(get_db)):
    rows = db.scalars(
        select(models.Service).where(models.Service.is_published.is_(True)).order_by(models.Service.position)
    ).all()
    response.headers["Cache-Control"] = CACHE
    return [service_public(s) for s in rows]


@router.get("/services/{slug}", response_model=schemas.ServicePublic)
def get_service(slug: str, response: Response, db: Session = Depends(get_db)):
    s = db.scalar(select(models.Service).where(models.Service.slug == slug, models.Service.is_published.is_(True)))
    if s is None:
        raise HTTPException(404, "Service not found.")
    response.headers["Cache-Control"] = CACHE
    return service_public(s)


@router.get("/categories", response_model=list[schemas.CategoryPublic])
def list_categories(response: Response, db: Session = Depends(get_db)):
    counts = category_counts(db)
    rows = db.scalars(
        select(models.ProductCategory)
        .where(models.ProductCategory.is_published.is_(True))
        .order_by(models.ProductCategory.position)
    ).all()
    response.headers["Cache-Control"] = CACHE
    return [category_public(c, counts.get(c.id, 0)) for c in rows]


@router.get("/categories/{slug}", response_model=schemas.CategoryPublic)
def get_category(slug: str, response: Response, db: Session = Depends(get_db)):
    c = db.scalar(
        select(models.ProductCategory).where(
            models.ProductCategory.slug == slug, models.ProductCategory.is_published.is_(True)
        )
    )
    if c is None:
        raise HTTPException(404, "Category not found.")
    response.headers["Cache-Control"] = CACHE
    return category_public(c, category_counts(db).get(c.id, 0))


@router.get("/products", response_model=list[schemas.ProductPublic])
def list_products(
    response: Response,
    category: str | None = Query(None, max_length=120),
    brand: str | None = Query(None, max_length=80),
    q: str | None = Query(None, max_length=80),
    db: Session = Depends(get_db),
):
    stmt = published_products_query()
    if category:
        stmt = stmt.where(models.ProductCategory.slug == category)
    if brand:
        stmt = stmt.where(models.Product.brand.ilike(brand))
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(models.Product.name.ilike(like), models.Product.model.ilike(like), models.Product.product_type.ilike(like))
        )
    response.headers["Cache-Control"] = CACHE
    return [product_public(p) for p in db.scalars(stmt).all()]


@router.get("/products/{slug}", response_model=schemas.ProductPublic)
def get_product(slug: str, response: Response, db: Session = Depends(get_db)):
    p = db.scalar(published_products_query().where(models.Product.slug == slug))
    if p is None:
        raise HTTPException(404, "Product not found.")
    response.headers["Cache-Control"] = CACHE
    return product_public(p)


@router.get("/pages", response_model=list[schemas.PagePublic])
def list_pages(response: Response, db: Session = Depends(get_db)):
    rows = db.scalars(select(models.PageSeo).order_by(models.PageSeo.path)).all()
    response.headers["Cache-Control"] = CACHE
    return [
        schemas.PagePublic(
            path=r.path, title=r.title, description=r.description, h1=r.h1,
            schema_type=r.schema_type, indexable=r.indexable, updated_at=r.content_updated_on,
        )
        for r in rows
    ]


@router.get("/redirects", response_model=list[schemas.RedirectPublic])
def list_redirects(response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = CACHE
    return db.scalars(select(models.Redirect).order_by(models.Redirect.source)).all()
