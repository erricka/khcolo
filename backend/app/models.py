"""Database tables.

Content tables carry `source_url(s)`, `review_status` and private `review_notes` so
unsupported or conflicting claims can be tracked and corrected. Review fields are
never exposed by the public API.
"""

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base

REVIEW_STATUSES = ("draft", "needs_review", "approved")


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    # Date the public content last changed. Drives sitemap <lastmod>.
    content_updated_on: Mapped[date] = mapped_column(Date, server_default=func.current_date())


class ReviewMixin:
    review_status: Mapped[str] = mapped_column(String(20), default="needs_review")
    review_notes: Mapped[list] = mapped_column(JSONB, default=list)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)


class SiteSetting(Base):
    __tablename__ = "site_settings"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[dict] = mapped_column(JSONB)
    review_status: Mapped[str] = mapped_column(String(20), default="needs_review")
    review_notes: Mapped[list] = mapped_column(JSONB, default=list)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Service(TimestampMixin, ReviewMixin, Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    group_key: Mapped[str] = mapped_column(String(40))
    position: Mapped[int] = mapped_column(Integer, default=0)
    name: Mapped[str] = mapped_column(String(160))
    short_name: Mapped[str] = mapped_column(String(80))
    icon: Mapped[str] = mapped_column(String(40))
    summary: Mapped[str] = mapped_column(Text)
    h1: Mapped[str] = mapped_column(String(200))
    intro: Mapped[str] = mapped_column(Text)
    seo_title: Mapped[str] = mapped_column(String(120))
    seo_description: Mapped[str] = mapped_column(String(320))
    # Structured page body: highlights, overview, capabilities, options, process, faqs, related.
    body: Mapped[dict] = mapped_column(JSONB, default=dict)
    source_url: Mapped[str | None] = mapped_column(String(500))


class ProductCategory(TimestampMixin, ReviewMixin, Base):
    __tablename__ = "product_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    position: Mapped[int] = mapped_column(Integer, default=0)
    name: Mapped[str] = mapped_column(String(120))
    singular: Mapped[str] = mapped_column(String(120))
    h1: Mapped[str] = mapped_column(String(200))
    summary: Mapped[str] = mapped_column(Text)
    intro: Mapped[str] = mapped_column(Text)
    facet_label: Mapped[str] = mapped_column(String(60))
    seo_title: Mapped[str] = mapped_column(String(120))
    seo_description: Mapped[str] = mapped_column(String(320))
    related_services: Mapped[list] = mapped_column(JSONB, default=list)
    source_url: Mapped[str | None] = mapped_column(String(500))

    products: Mapped[list["Product"]] = relationship(back_populates="category", order_by="Product.position")


class Media(Base):
    __tablename__ = "media"

    id: Mapped[int] = mapped_column(primary_key=True)
    src: Mapped[str] = mapped_column(String(500), unique=True)
    alt: Mapped[str] = mapped_column(String(300))
    width: Mapped[int] = mapped_column(Integer)
    height: Mapped[int] = mapped_column(Integer)
    source_url: Mapped[str | None] = mapped_column(String(500))
    # Image rights must be confirmed by the owner before launch.
    rights_status: Mapped[str] = mapped_column(String(20), default="needs_review")


class Product(TimestampMixin, ReviewMixin, Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("product_categories.id", ondelete="RESTRICT"), index=True)
    position: Mapped[int] = mapped_column(Integer, default=0)
    brand: Mapped[str | None] = mapped_column(String(80))
    series: Mapped[str | None] = mapped_column(String(80))
    model: Mapped[str] = mapped_column(String(120))
    name: Mapped[str] = mapped_column(String(200))
    variant: Mapped[str | None] = mapped_column(String(200))
    product_type: Mapped[str] = mapped_column(String(160))
    facet: Mapped[str] = mapped_column(String(60))
    summary: Mapped[str] = mapped_column(Text)
    key_specs: Mapped[list] = mapped_column(JSONB, default=list)
    accessories: Mapped[list] = mapped_column(JSONB, default=list)
    public_notes: Mapped[list] = mapped_column(JSONB, default=list)
    seo_title: Mapped[str] = mapped_column(String(120))
    seo_description: Mapped[str] = mapped_column(String(320))
    source_urls: Mapped[list] = mapped_column(JSONB, default=list)
    image_id: Mapped[int | None] = mapped_column(ForeignKey("media.id", ondelete="SET NULL"))

    category: Mapped[ProductCategory] = relationship(back_populates="products")
    image: Mapped[Media | None] = relationship()
    specs: Mapped[list["ProductSpec"]] = relationship(
        back_populates="product", order_by="ProductSpec.position", cascade="all, delete-orphan"
    )


class ProductSpec(Base):
    __tablename__ = "product_specs"
    __table_args__ = (UniqueConstraint("product_id", "position"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer)
    label: Mapped[str] = mapped_column(String(120))
    value: Mapped[str] = mapped_column(String(400))

    product: Mapped[Product] = relationship(back_populates="specs")


class PageSeo(Base):
    __tablename__ = "page_seo"

    path: Mapped[str] = mapped_column(String(300), primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(String(320))
    h1: Mapped[str] = mapped_column(String(200))
    schema_type: Mapped[str] = mapped_column(String(80))
    indexable: Mapped[bool] = mapped_column(Boolean, default=True)
    source_url: Mapped[str | None] = mapped_column(String(500))
    content_updated_on: Mapped[date] = mapped_column(Date, server_default=func.current_date())


class Redirect(Base):
    __tablename__ = "redirects"

    id: Mapped[int] = mapped_column(primary_key=True)
    source: Mapped[str] = mapped_column(String(300), unique=True)
    # Null destination with status 410 marks a deliberately removed URL.
    destination: Mapped[str | None] = mapped_column(String(300))
    status_code: Mapped[int] = mapped_column(Integer, default=308)
    note: Mapped[str | None] = mapped_column(Text)


class Inquiry(Base):
    __tablename__ = "inquiries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    name: Mapped[str] = mapped_column(String(120))
    company: Mapped[str | None] = mapped_column(String(160))
    email: Mapped[str | None] = mapped_column(String(254))
    phone: Mapped[str | None] = mapped_column(String(40))
    preferred_contact: Mapped[str | None] = mapped_column(String(20))
    request_type: Mapped[str] = mapped_column(String(20))
    interest: Mapped[str] = mapped_column(String(120))
    product_slug: Mapped[str | None] = mapped_column(String(160))
    message: Mapped[str] = mapped_column(Text)
    consent: Mapped[bool] = mapped_column(Boolean)
    source_path: Mapped[str | None] = mapped_column(String(300))
    # Salted hash only: used for rate limiting, never the raw address.
    ip_hash: Mapped[str] = mapped_column(String(64), index=True)
    user_agent: Mapped[str | None] = mapped_column(String(300))
    status: Mapped[str] = mapped_column(String(20), default="new")
    notification_status: Mapped[str] = mapped_column(String(20), default="pending")
    notified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
