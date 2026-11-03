import re
import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


# ---------------------------------------------------------------------------
# Shared content blocks
# ---------------------------------------------------------------------------

class Seo(CamelModel):
    title: str = Field(max_length=120)
    description: str = Field(max_length=320)


class Overview(CamelModel):
    heading: str
    body: list[str]


class CapabilityGroup(CamelModel):
    title: str
    items: list[str]


class OptionCard(CamelModel):
    title: str
    meta: str | None = None
    body: str | None = None
    items: list[str] = []


class OptionBlock(CamelModel):
    heading: str
    intro: str | None = None
    layout: Literal["cards", "table", "tags"]
    cards: list[OptionCard] = []
    columns: list[str] = []
    rows: list[list[str]] = []
    tags: list[str] = []
    note: str | None = None


class Step(CamelModel):
    title: str
    body: str


class Faq(CamelModel):
    q: str
    a: str


class ServiceBody(CamelModel):
    """The structured part of a service page, stored as JSONB."""

    highlights: list[str] = []
    overview: Overview
    capabilities: list[CapabilityGroup] = []
    capabilities_note: str = ""
    options: list[OptionBlock] = []
    process: list[Step] = []
    faqs: list[Faq] = []
    related: list[str] = []
    related_categories: list[str] = []


# ---------------------------------------------------------------------------
# Public read models
# ---------------------------------------------------------------------------

class ServicePublic(ServiceBody):
    slug: str
    group: str
    position: int
    name: str
    short_name: str
    icon: str
    summary: str
    h1: str
    intro: str
    seo: Seo
    updated_at: date


class CategoryPublic(CamelModel):
    slug: str
    position: int
    name: str
    singular: str
    h1: str
    summary: str
    intro: str
    facet_label: str
    seo: Seo
    related_services: list[str]
    product_count: int
    updated_at: date


class SpecRow(CamelModel):
    label: str = Field(max_length=120)
    value: str = Field(max_length=400)


class ImagePublic(CamelModel):
    src: str
    alt: str
    width: int
    height: int


class ProductPublic(CamelModel):
    slug: str
    category: str
    position: int
    brand: str | None
    series: str | None = None
    model: str
    name: str
    variant: str | None = None
    type: str
    facet: str
    summary: str
    key_specs: list[str]
    specs: list[SpecRow]
    accessories: list[str]
    public_notes: list[str]
    image: ImagePublic | None
    seo: Seo
    updated_at: date


class PagePublic(CamelModel):
    path: str
    title: str
    description: str
    h1: str
    schema_type: str
    indexable: bool
    updated_at: date


class RedirectPublic(CamelModel):
    source: str
    destination: str | None
    status_code: int


# ---------------------------------------------------------------------------
# Inquiries
# ---------------------------------------------------------------------------

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_PHONE = re.compile(r"^\+?[0-9 ()\-.]{6,32}$")


class InquiryIn(CamelModel):
    model_config = ConfigDict(
        alias_generator=to_camel, populate_by_name=True, str_strip_whitespace=True, extra="forbid"
    )

    name: str = Field(min_length=2, max_length=120)
    company: str | None = Field(default=None, max_length=160)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=40)
    preferred_contact: Literal["email", "phone", "telegram"] | None = None
    request_type: Literal["general", "quote", "consultation"] = "general"
    interest: str = Field(min_length=2, max_length=120)
    product_slug: str | None = Field(default=None, max_length=160)
    message: str = Field(min_length=10, max_length=4000)
    consent: bool
    source_path: str | None = Field(default=None, max_length=300)
    # Honeypot. Real visitors never see or fill this field.
    website: str | None = Field(default=None, max_length=200)

    @field_validator("company", "email", "phone", "product_slug", "source_path", "website", "preferred_contact", mode="before")
    @classmethod
    def blank_to_none(cls, v):
        if isinstance(v, str) and not v.strip():
            return None
        return v

    @field_validator("name", "company", "interest", "message")
    @classmethod
    def no_control_chars(cls, v: str | None):
        if v is not None and _CONTROL_CHARS.search(v):
            raise ValueError("contains unsupported characters")
        return v

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, v: str | None):
        if v is None:
            return v
        digits = re.sub(r"\D", "", v)
        if not _PHONE.match(v) or len(digits) < 6:
            raise ValueError("enter a valid phone number")
        return v

    @field_validator("consent")
    @classmethod
    def must_consent(cls, v: bool):
        if not v:
            raise ValueError("please confirm you have read the privacy notice")
        return v

    @model_validator(mode="after")
    def email_or_phone(self):
        if not self.email and not self.phone:
            raise ValueError("provide an email address or a phone number so we can reply")
        return self


class InquiryReceipt(CamelModel):
    id: uuid.UUID
    status: Literal["received"] = "received"
    received_at: datetime


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------

InquiryStatus = Literal["new", "in_progress", "closed", "spam"]
ReviewStatus = Literal["draft", "needs_review", "approved"]


class InquiryAdmin(CamelModel):
    id: uuid.UUID
    created_at: datetime
    name: str
    company: str | None
    email: str | None
    phone: str | None
    preferred_contact: str | None
    request_type: str
    interest: str
    product_slug: str | None
    message: str
    source_path: str | None
    status: str
    notification_status: str
    notified_at: datetime | None


class InquiryList(CamelModel):
    total: int
    items: list[InquiryAdmin]


class InquiryStatusUpdate(CamelModel):
    status: InquiryStatus


class ReviewItem(CamelModel):
    kind: Literal["setting", "service", "category", "product"]
    key: str
    name: str
    review_status: str
    review_notes: list[str]
    source_urls: list[str]
    is_published: bool


class ServiceUpdate(CamelModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="forbid")

    name: str | None = None
    short_name: str | None = None
    summary: str | None = None
    h1: str | None = None
    intro: str | None = None
    seo: Seo | None = None
    body: ServiceBody | None = None
    review_status: ReviewStatus | None = None
    review_notes: list[str] | None = None
    is_published: bool | None = None


class ProductUpdate(CamelModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="forbid")

    name: str | None = None
    model: str | None = None
    variant: str | None = None
    type: str | None = None
    facet: str | None = None
    summary: str | None = None
    key_specs: list[str] | None = None
    specs: list[SpecRow] | None = None
    accessories: list[str] | None = None
    public_notes: list[str] | None = None
    seo: Seo | None = None
    review_status: ReviewStatus | None = None
    review_notes: list[str] | None = None
    is_published: bool | None = None
