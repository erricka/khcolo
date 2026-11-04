"""Google reCAPTCHA v3 on the inquiry endpoint. Google's siteverify call is replaced with a stub."""

import httpx
import pytest

from app import recaptcha
from app.config import get_settings


@pytest.fixture
def recaptcha_on(monkeypatch):
    monkeypatch.setattr(get_settings(), "recaptcha_secret_key", "test-secret")
    calls = []

    def answer(result):
        def fake_post(url, data, timeout):
            calls.append(data)
            return httpx.Response(200, json=result, request=httpx.Request("POST", url))
        monkeypatch.setattr(recaptcha.httpx, "post", fake_post)

    return answer, calls


def test_off_by_default_accepts_without_token(client, valid_inquiry):
    assert get_settings().recaptcha_secret_key is None
    assert client.post("/api/v1/inquiries", json=valid_inquiry).status_code == 201


def test_missing_token_is_rejected(client, valid_inquiry, recaptcha_on):
    r = client.post("/api/v1/inquiries", json=valid_inquiry)
    assert r.status_code == 400 and "person" in r.json()["detail"]


def test_good_score_is_accepted_and_secret_sent(client, valid_inquiry, recaptcha_on):
    answer, calls = recaptcha_on
    answer({"success": True, "action": "inquiry", "score": 0.9})
    r = client.post("/api/v1/inquiries", json={**valid_inquiry, "recaptchaToken": "tok"})
    assert r.status_code == 201
    assert calls[0]["secret"] == "test-secret" and calls[0]["response"] == "tok"


@pytest.mark.parametrize("result", [
    {"success": True, "action": "inquiry", "score": 0.1},          # likely a bot
    {"success": True, "action": "login", "score": 0.9},            # token made for another action
    {"success": False, "error-codes": ["invalid-input-response"]},  # forged or expired token
])
def test_bad_results_are_rejected_and_not_saved(client, valid_inquiry, admin_headers, recaptcha_on, result):
    answer, _ = recaptcha_on
    answer(result)
    assert client.post("/api/v1/inquiries", json={**valid_inquiry, "recaptchaToken": "tok"}).status_code == 400
    assert client.get("/api/v1/admin/inquiries", headers=admin_headers).json()["total"] == 0


def test_google_unreachable_does_not_lose_the_inquiry(client, valid_inquiry, monkeypatch):
    monkeypatch.setattr(get_settings(), "recaptcha_secret_key", "test-secret")

    def down(*a, **k):
        raise httpx.ConnectError("no route")

    monkeypatch.setattr(recaptcha.httpx, "post", down)
    assert client.post("/api/v1/inquiries", json={**valid_inquiry, "recaptchaToken": "tok"}).status_code == 201
