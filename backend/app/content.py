"""Convert database rows into public API models."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from . import models, schemas


def service_public(s: models.Service) -> schemas.ServicePublic:
    body = schemas.ServiceBody.model_validate(s.body)
    return schemas.ServicePublic(
        **body.model_dump(),
        slug=s.slug,
        group=s.group_key,
        position=s.position,
        name=s.name,
        short_name=s.short_name,
        icon=s.icon,
        summary=s.summary,
        h1=s.h1,
        intro=s.intro,
        seo=schemas.Seo(title=s.seo_title, description=s.seo_description),
        updated_at=s.content_updated_on,
    )


def category_public(c: models.ProductCategory, product_count: int) -> schemas.CategoryPublic:
    return schemas.CategoryPublic(
        slug=c.slug,
        position=c.position,
        name=c.name,
        singular=c.singular,
        h1=c.h1,
        summary=c.summary,
        intro=c.intro,
        facet_label=c.facet_label,
        seo=schemas.Seo(title=c.seo_title, description=c.seo_description),
        related_services=c.related_services,
        product_count=product_count,
        updated_at=c.content_updated_on,
    )


def product_public(p: models.Product) -> schemas.ProductPublic:
    image = None
    if p.image is not None:
        image = schemas.ImagePublic(src=p.image.src, alt=p.image.alt, width=p.image.width, height=p.image.height)
    return schemas.ProductPublic(
        slug=p.slug,
        category=p.category.slug,
        position=p.position,
        brand=p.brand,
        series=p.series,
        model=p.model,
        name=p.name,
        variant=p.variant,
        type=p.product_type,
        facet=p.facet,
        summary=p.summary,
        key_specs=p.key_specs,
        specs=[schemas.SpecRow(label=r.label, value=r.value) for r in p.specs],
        accessories=p.accessories,
        public_notes=p.public_notes,
        image=image,
        seo=schemas.Seo(title=p.seo_title, description=p.seo_description),
        updated_at=p.content_updated_on,
    )


def published_products_query():
    return (
        select(models.Product)
        .join(models.ProductCategory)
        .where(models.Product.is_published.is_(True), models.ProductCategory.is_published.is_(True))
        .options(
            selectinload(models.Product.specs),
            selectinload(models.Product.image),
            selectinload(models.Product.category),
        )
        .order_by(models.ProductCategory.position, models.Product.position)
    )


def category_counts(db: Session) -> dict[int, int]:
    rows = db.execute(
        select(models.Product.category_id, func.count())
        .where(models.Product.is_published.is_(True))
        .group_by(models.Product.category_id)
    ).all()
    return {cid: n for cid, n in rows}
