from sqlalchemy import text

from app.config import get_settings
from app.db import engine


def test_health(client):
    assert client.get("/api/v1/health").json() == {"status": "ok"}


def test_services_are_public_without_review_data(client):
    res = client.get("/api/v1/services")
    assert res.status_code == 200
    services = res.json()
    assert len(services) == 10
    for s in services:
        assert "review" not in s and "reviewNotes" not in s and "sourceUrl" not in s
        assert s["seo"]["title"].endswith("— KHCOLO")
    assert res.headers["x-robots-tag"] == "noindex, nofollow"


def test_site_settings_hide_review(client):
    site = client.get("/api/v1/site").json()
    assert site["email"] == "support@khcolo.com"
    assert "review" not in site


def test_product_detail_and_404(client):
    res = client.get("/api/v1/products/yealink-sip-t46u-ip-phone")
    assert res.status_code == 200
    body = res.json()
    assert body["category"] == "ip-phone"
    assert {"label": "SIP accounts", "value": "16"} in body["specs"]
    assert "reviewNotes" not in body
    assert client.get("/api/v1/products/does-not-exist").status_code == 404
    # The duplicate listing is a redirect, not a second product.
    assert client.get("/api/v1/products/yealink-sip-t46u-ip-phone-2").status_code == 404


def test_product_filters(client):
    assert len(client.get("/api/v1/products", params={"category": "ip-pbx"}).json()) == 7
    assert len(client.get("/api/v1/products", params={"brand": "grandstream"}).json()) == 2
    names = [p["name"] for p in client.get("/api/v1/products", params={"q": "TG800"}).json()]
    assert names == ["Yeastar NeoGate TG800", "Yeastar NeoGate TG800WM"]


def test_redirect_map(client):
    redirects = {r["source"]: r for r in client.get("/api/v1/redirects").json()}
    t46u = redirects["/product/yealink-sip-t46u-ip-phone-2/"]
    assert t46u["destination"] == "/product/yealink-sip-t46u-ip-phone/" and t46u["statusCode"] == 308
    assert redirects["/feed/"]["statusCode"] == 410


def test_inquiry_is_persisted(client, valid_inquiry):
    res = client.post("/api/v1/inquiries", json=valid_inquiry)
    assert res.status_code == 201, res.text
    receipt = res.json()
    assert receipt["status"] == "received"
    # Receipt never echoes personal data back.
    assert set(receipt) == {"id", "status", "receivedAt"}
    with engine.connect() as conn:
        row = conn.execute(text("select name, email, ip_hash, notification_status from inquiries")).one()
    assert row.name == "Sokha Chan" and row.email == "sokha@example.com"
    assert len(row.ip_hash) == 64 and row.ip_hash != "testclient"
    # No notification channel configured, so nothing claims to have been sent.
    assert row.notification_status == "disabled"


def test_inquiry_requires_email_or_phone(client, valid_inquiry):
    valid_inquiry.update(email="", phone="")
    res = client.post("/api/v1/inquiries", json=valid_inquiry)
    assert res.status_code == 422
    assert "email address or a phone number" in res.text


def test_inquiry_validation_errors(client, valid_inquiry):
    for field, value in [("consent", False), ("email", "not-an-email"), ("phone", "abc"),
                         ("message", "short"), ("name", "")]:
        bad = dict(valid_inquiry, **{field: value})
        assert client.post("/api/v1/inquiries", json=bad).status_code == 422, field


def test_inquiry_rejects_unknown_interest_and_product(client, valid_inquiry):
    assert client.post("/api/v1/inquiries", json=dict(valid_inquiry, interest="crypto")).status_code == 422
    assert client.post("/api/v1/inquiries", json=dict(valid_inquiry, productSlug="nope")).status_code == 422
    ok = dict(valid_inquiry, interest="hardware", requestType="quote", productSlug="yeastar-s20")
    assert client.post("/api/v1/inquiries", json=ok).status_code == 201


def test_inquiry_rejects_unexpected_fields(client, valid_inquiry):
    assert client.post("/api/v1/inquiries", json=dict(valid_inquiry, status="closed")).status_code == 422


def test_honeypot_is_rejected_and_not_saved(client, valid_inquiry):
    res = client.post("/api/v1/inquiries", json=dict(valid_inquiry, website="http://spam.example"))
    assert res.status_code == 400
    with engine.connect() as conn:
        assert conn.execute(text("select count(*) from inquiries")).scalar() == 0


def test_rate_limit(client, valid_inquiry):
    limit = get_settings().inquiry_rate_limit
    for _ in range(limit):
        assert client.post("/api/v1/inquiries", json=valid_inquiry).status_code == 201
    res = client.post("/api/v1/inquiries", json=valid_inquiry)
    assert res.status_code == 429
    assert "Retry-After" in res.headers


def test_oversized_body_rejected(client, valid_inquiry):
    big = dict(valid_inquiry, message="x" * 40_000)
    assert client.post("/api/v1/inquiries", json=big).status_code == 413


def test_inquiries_are_not_publicly_readable(client, valid_inquiry):
    client.post("/api/v1/inquiries", json=valid_inquiry)
    assert client.get("/api/v1/inquiries").status_code == 405
    assert client.get("/api/v1/admin/inquiries").status_code == 401
    assert client.get("/api/v1/admin/inquiries", headers={"Authorization": "Bearer wrong"}).status_code == 401


def test_admin_can_list_and_update_inquiries(client, valid_inquiry, admin_headers):
    client.post("/api/v1/inquiries", json=valid_inquiry)
    listing = client.get("/api/v1/admin/inquiries", headers=admin_headers)
    assert listing.status_code == 200 and listing.json()["total"] == 1
    item = listing.json()["items"][0]
    assert "ipHash" not in item
    res = client.patch(f"/api/v1/admin/inquiries/{item['id']}", json={"status": "closed"}, headers=admin_headers)
    assert res.json()["status"] == "closed"
    assert listing.headers["cache-control"] == "no-store"


def test_admin_review_list_contains_known_issues(client, admin_headers):
    items = {i["key"]: i for i in client.get("/api/v1/admin/review", headers=admin_headers).json()}
    assert any("23 direct-dial keys" in n for n in items["yealink-sip-t48u-ip-phone"]["reviewNotes"])
    assert any("404" in n for n in items["proxmoxve"]["reviewNotes"])


def test_admin_product_edit_replaces_specs(client, admin_headers):
    slug = "yeastar-neogate-tg400-gsm-gateway"
    before = client.get(f"/api/v1/products/{slug}").json()
    specs = before["specs"]
    specs[0] = {"label": "Channels", "value": "4 × GSM"}
    res = client.patch(f"/api/v1/admin/products/{slug}", json={"specs": specs, "reviewStatus": "approved"},
                       headers=admin_headers)
    assert res.status_code == 200, res.text
    assert client.get(f"/api/v1/products/{slug}").json()["specs"][0]["value"] == "4 × GSM"
    # restore
    client.patch(f"/api/v1/admin/products/{slug}", json={"specs": before["specs"]}, headers=admin_headers)


def test_unpublished_service_disappears(client, admin_headers):
    client.patch("/api/v1/admin/services/zimbra", json={"isPublished": False}, headers=admin_headers)
    assert client.get("/api/v1/services/zimbra").status_code == 404
    client.patch("/api/v1/admin/services/zimbra", json={"isPublished": True}, headers=admin_headers)
    assert client.get("/api/v1/services/zimbra").status_code == 200


def test_validation_errors_do_not_echo_input(client, valid_inquiry):
    res = client.post("/api/v1/inquiries", json=dict(valid_inquiry, email="", phone=""))
    assert res.status_code == 422
    assert "sokha" not in res.text.lower() and "input" not in res.json()["detail"][0]


def test_platform_urls_are_normalised():
    from app.config import Settings

    s = Settings(database_url="postgresql://u:p@db-host/khcolo", frontend_revalidate_url="khcolo-web:10000")
    assert s.database_url == "postgresql+psycopg://u:p@db-host/khcolo"
    assert s.frontend_revalidate_url == "http://khcolo-web:10000/api/revalidate/"
    assert Settings(database_url="postgres://u:p@h/db").database_url.startswith("postgresql+psycopg://")


def test_internal_key_locks_the_api(client, monkeypatch):
    monkeypatch.setattr(get_settings(), "internal_api_key", "shared-secret")
    assert client.get("/api/v1/health").status_code == 200
    assert client.get("/api/v1/services").status_code == 404
    assert client.get("/api/v1/services", headers={"x-internal-key": "wrong"}).status_code == 404
    assert client.get("/api/v1/services", headers={"x-internal-key": "shared-secret"}).status_code == 200
