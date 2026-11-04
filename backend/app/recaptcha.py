"""Google reCAPTCHA v3 check for the inquiry form.

The browser asks Google for a token when the visitor presses "Send request"; this module
sends that token to Google's siteverify endpoint with the secret key and accepts the
inquiry only if Google says it is valid, it was made for the "inquiry" action, and the
score is at least RECAPTCHA_MIN_SCORE.

If Google cannot be reached at all, the inquiry is accepted and a warning is logged, so a
Google outage never loses a customer's request. The honeypot and the rate limits still apply.
"""

import ipaddress
import logging

import httpx

from .config import Settings

log = logging.getLogger("khcolo.recaptcha")

VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"


def check(token: str | None, remote_ip: str | None, settings: Settings) -> bool:
    """Return True if the request may proceed."""
    if not settings.recaptcha_secret_key:
        return True  # reCAPTCHA not configured
    if not token:
        return False

    data = {"secret": settings.recaptcha_secret_key, "response": token}
    try:
        data["remoteip"] = str(ipaddress.ip_address((remote_ip or "").strip()))
    except ValueError:
        pass  # optional for Google; only sent when it is a real address
    try:
        resp = httpx.post(VERIFY_URL, data=data, timeout=8.0)
        resp.raise_for_status()
        result = resp.json()
    except (httpx.HTTPError, ValueError) as exc:
        log.warning("reCAPTCHA verification unavailable, accepting the inquiry: %s", exc)
        return True

    ok = (
        result.get("success") is True
        and result.get("action") == settings.recaptcha_action
        and float(result.get("score", 0.0)) >= settings.recaptcha_min_score
    )
    if not ok:
        log.info(
            "reCAPTCHA rejected an inquiry: success=%s action=%s score=%s errors=%s",
            result.get("success"), result.get("action"), result.get("score"), result.get("error-codes"),
        )
    return ok
