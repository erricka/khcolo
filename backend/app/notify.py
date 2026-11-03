"""Optional inquiry notifications.

Nothing is sent unless a channel is fully configured. The inquiry is already saved
before this runs, so a failed notification never loses a request; the outcome is
recorded on the inquiry row for staff to see.
"""

import logging
import smtplib
import uuid
from datetime import datetime, timezone
from email.message import EmailMessage

import httpx

from .config import Settings, get_settings
from .db import SessionLocal
from .models import Inquiry

log = logging.getLogger("khcolo.notify")


def _summary(inq: Inquiry) -> str:
    lines = [
        f"New website inquiry ({inq.request_type})",
        f"Interest: {inq.interest}" + (f" / product: {inq.product_slug}" if inq.product_slug else ""),
        f"Name: {inq.name}" + (f" ({inq.company})" if inq.company else ""),
    ]
    if inq.email:
        lines.append(f"Email: {inq.email}")
    if inq.phone:
        lines.append(f"Phone: {inq.phone}")
    if inq.preferred_contact:
        lines.append(f"Prefers: {inq.preferred_contact}")
    lines += ["", inq.message[:1500], "", f"Ref: {inq.id}"]
    return "\n".join(lines)


def _send_telegram(settings: Settings, text: str) -> None:
    resp = httpx.post(
        f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage",
        json={"chat_id": settings.telegram_chat_id, "text": text, "disable_web_page_preview": True},
        timeout=10,
    )
    resp.raise_for_status()


def _send_email(settings: Settings, inq: Inquiry, text: str) -> None:
    msg = EmailMessage()
    msg["Subject"] = f"Website inquiry: {inq.interest} ({inq.request_type})"
    msg["From"] = settings.smtp_from
    msg["To"] = settings.notify_email_to
    if inq.email:
        msg["Reply-To"] = inq.email
    msg.set_content(text)
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
        smtp.starttls()
        if settings.smtp_username:
            smtp.login(settings.smtp_username, settings.smtp_password or "")
        smtp.send_message(msg)


def notify_inquiry(inquiry_id: uuid.UUID) -> None:
    settings = get_settings()
    telegram_ready = bool(settings.telegram_bot_token and settings.telegram_chat_id)
    email_ready = bool(settings.smtp_host and settings.smtp_from and settings.notify_email_to)

    with SessionLocal() as db:
        inq = db.get(Inquiry, inquiry_id)
        if inq is None:
            return
        if not (telegram_ready or email_ready):
            inq.notification_status = "disabled"
            db.commit()
            return

        text = _summary(inq)
        sent, failed = 0, 0
        for ready, send in ((telegram_ready, lambda: _send_telegram(settings, text)),
                            (email_ready, lambda: _send_email(settings, inq, text))):
            if not ready:
                continue
            try:
                send()
                sent += 1
            except Exception as exc:  # noqa: BLE001 - log and record, never raise into the request
                failed += 1
                log.warning("Inquiry notification failed for %s: %s", inquiry_id, type(exc).__name__)

        inq.notification_status = "sent" if sent and not failed else ("partial" if sent else "failed")
        if sent:
            inq.notified_at = datetime.now(timezone.utc)
        db.commit()


def trigger_revalidation(paths: list[str] | None = None) -> bool:
    """Ask the Next.js site to regenerate pages after a content edit."""
    settings = get_settings()
    if not (settings.frontend_revalidate_url and settings.revalidate_secret):
        return False
    try:
        resp = httpx.post(
            settings.frontend_revalidate_url,
            json={"paths": paths or []},
            headers={"x-revalidate-secret": settings.revalidate_secret},
            timeout=10,
        )
        resp.raise_for_status()
        return True
    except httpx.HTTPError as exc:
        log.warning("Revalidation request failed: %s", type(exc).__name__)
        return False
