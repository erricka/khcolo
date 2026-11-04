from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import Settings, get_settings
from ..db import get_db
from ..notify import notify_inquiry
from ..recaptcha import check as recaptcha_check
from ..security import client_ip, enforce_inquiry_rate_limit, hash_ip

router = APIRouter(tags=["inquiries"])

GENERAL_INTERESTS = {"general", "hardware"}


@router.post("/inquiries", response_model=schemas.InquiryReceipt, status_code=status.HTTP_201_CREATED)
def create_inquiry(
    payload: schemas.InquiryIn,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """Store an inquiry or appointment request.

    A 201 response means the request was saved. It does not confirm an appointment;
    staff follow up to arrange one.
    """
    if payload.website:
        # Honeypot filled in: almost certainly automated. Reject without saving.
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Your request could not be processed.")

    if not recaptcha_check(payload.recaptcha_token, client_ip(request, settings), settings):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "We couldn't confirm this request came from a person. Please try again, or message us on Telegram.",
        )

    allowed = GENERAL_INTERESTS | set(db.scalars(select(models.Service.slug).where(models.Service.is_published.is_(True))))
    if payload.interest not in allowed:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, [
            {"loc": ["body", "interest"], "msg": "Choose one of the listed topics.", "type": "value_error"}
        ])
    if payload.product_slug:
        exists = db.scalar(
            select(models.Product.id).where(models.Product.slug == payload.product_slug, models.Product.is_published.is_(True))
        )
        if exists is None:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, [
                {"loc": ["body", "productSlug"], "msg": "Unknown product.", "type": "value_error"}
            ])

    ip_hash = hash_ip(client_ip(request, settings), settings)
    enforce_inquiry_rate_limit(db, ip_hash, settings)

    inquiry = models.Inquiry(
        name=payload.name,
        company=payload.company,
        email=str(payload.email) if payload.email else None,
        phone=payload.phone,
        preferred_contact=payload.preferred_contact,
        request_type=payload.request_type,
        interest=payload.interest,
        product_slug=payload.product_slug,
        message=payload.message,
        consent=payload.consent,
        source_path=payload.source_path,
        ip_hash=ip_hash,
        user_agent=(request.headers.get("user-agent") or "")[:300] or None,
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    background.add_task(notify_inquiry, inquiry.id)
    return schemas.InquiryReceipt(id=inquiry.id, received_at=inquiry.created_at)
