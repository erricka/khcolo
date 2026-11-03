# Verification report

Checks run on 3 November 2026 against a production build (`next build`, standalone server) reading
content from the FastAPI service and PostgreSQL 16, unless noted. Everything listed as passed was
run and observed; checks that need production infrastructure or owner accounts are listed at the
end.

## Summary

| Area | Result |
| --- | --- |
| API test suite (`pytest`, 21 tests, real PostgreSQL) | 21 passed |
| TypeScript (`tsc --noEmit`) and production build | Clean, no warnings; 57 routes pre-rendered |
| No-JS crawl of all 48 sitemap URLs | 48 × 200, one H1 each, self-canonical, 145–160 char descriptions, OG image, valid JSON-LD |
| Internal links found in HTML | 48 unique, none broken |
| Redirects / status codes | All 9 edge cases as expected (below) |
| Structured data (offline structural check) | 96 blocks across 48 pages, 0 issues |
| Browser checks (Playwright, Chromium) | 19 of 19 passed |
| Lighthouse (lab) | Accessibility, Best Practices and SEO 100 on all 10 runs; Performance 94–99 mobile, 100 desktop |

## HTTP behaviour

| Request | Expected | Observed |
| --- | --- | --- |
| `/about-us` | 308 → `/about-us/` | 308 → `/about-us/` |
| `/product/yealink-sip-t46u-ip-phone-2/` | 308 → canonical T46U | 308 → `/product/yealink-sip-t46u-ip-phone/` |
| `//3cx-bitrix24-integration/` | 308 → single slash | 308 → `/3cx-bitrix24-integration/` |
| `/feed/`, `/comments/feed/` | 410 | 410 |
| `/nope/`, `/product/nope/`, `/product-category/nope/` | 404 | 404 |
| `/proxmox-backup-server/` | 404 (was already broken) | 404 |
| `/robots.txt` (production build) | allow `/`, disallow `/api/`, sitemap | as expected |
| `/robots.txt` (staging build, `SITE_ENV` unset) | disallow all | disallow all, plus `X-Robots-Tag: noindex, nofollow` on every page |
| Security headers on `/` | nosniff, referrer policy, frame options, permissions policy | all present |
| API responses | `X-Robots-Tag: noindex` | present on every endpoint |

## Inquiry flow (site → Next.js route → FastAPI → PostgreSQL)

| Case | Result |
| --- | --- |
| Valid quote request | 201, row stored; receipt contains only id, status and time |
| Visitor IP | Forwarded through the site route; stored only as a salted HMAC (verified against the expected hash) |
| No email and no phone | 422 with a clear message; submitted values are not echoed back |
| Honeypot filled | 400, nothing stored |
| Sixth request in 10 minutes from one client | 429 with `Retry-After: 600`; a different client is still accepted |
| Unknown topic or product | 422 |
| `GET /api/inquiry/`, `GET /api/v1/inquiries` | 405 (inquiries are never publicly readable) |
| Admin endpoints without / with wrong token | 401 |
| Notifications with no channel configured | Row marked `disabled`; nothing claims to have been sent |
| Admin edit of a service | Revalidation webhook fired; service page, homepage and sitemap `lastmod` updated within seconds; wrong secret returns 401 |

## Browser checks (Playwright)

All passed:

- Quote links prefill request type and product.
- Empty submit shows an error summary, moves focus to it and sets `aria-invalid` on fields.
- A valid submit shows "Request received" only after the API saves it; the message is focused and on screen.
- A simulated server error shows an honest error and never "received".
- The analytics event contains no personal data: `{"event":"inquiry_submitted","request_type":"quote","interest":"hardware"}`.
- No console errors on the contact page.
- JavaScript disabled: no content left invisible by reveal styles, and FAQ answers are readable.
- Reduced motion: decorative loops hidden, entrance animations neutralised, no transform offsets.
- Keyboard: the first Tab reaches the skip link; focused elements show a 2px outline; the Solutions menu opens with Enter and Escape closes it, returning focus to the trigger.
- No horizontal overflow at 360px, 768px or 1440px on six templates (home, service, category, product, contact, about).
- Catalog: the type filter and search narrow 14 gateways → 7 → 2 and update the URL.

Visual review was done from screenshots at 390px, 768px and 1440px of every template, the mega
menus, the mobile drawer, form states and hover states.

## Lighthouse 13.6 (lab, local server, simulated throttling)

| Page | Form factor | Perf | A11y | Best practices | SEO | FCP | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| home | mobile | 96 | 100 | 100 | 100 | 1.0 s | 1.0 s | 0 | 220 ms |
| home | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0.3 s | 0 | 0 ms |
| service | mobile | 99 | 100 | 100 | 100 | 0.9 s | 0.9 s | 0 | 90 ms |
| service | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0.3 s | 0 | 0 ms |
| category | mobile | 94 | 100 | 100 | 100 | 1.0 s | 1.0 s | 0 | 300 ms |
| category | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0.3 s | 0 | 50 ms |
| product | mobile | 95 | 100 | 100 | 100 | 0.9 s | 2.9 s | 0 | 90 ms |
| product | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0.7 s | 0 | 0 ms |
| contact | mobile | 95 | 100 | 100 | 100 | 0.9 s | 0.9 s | 0 | 250 ms |
| contact | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0.3 s | 0 | 0 ms |

Conditions: Lighthouse defaults (mobile = Moto G Power emulation, slow 4G, 4× CPU slowdown),
headless Chromium 1243, server on the same machine, so network latency is simulated, not real.
Mobile results vary by ±3–5 points between runs.

Notes:

- **Product page mobile LCP (2.9 s)** is the product photo. The observed (unthrottled) timings were
  15 ms to first byte, 60 ms to load a 10 KB AVIF requested at high priority, and 175 ms render delay.
  The 2.9 s figure is Lighthouse's slow-4G model of that chain. Field data will tell the real story.
- Changes made because of these measurements: hero paragraphs no longer fade in (they were the LCP
  element on some pages); the hero diagram became a server component; Motion features load lazily;
  an unused font axis was dropped (Instrument Sans 57 KB → 30 KB); tap targets, contrast and heading
  order were fixed to reach accessibility 100.
- Lab scores are diagnostics. They do not prove field Core Web Vitals or rankings.

## Docker

No Docker daemon was available in the build environment, so the images were **not** built.
Instead, both Dockerfiles' steps were rehearsed without Docker:

- **Frontend:** a clean copy, `npm ci`, and a build with no API (content-file mode, staging
  `SITE_ENV`) pre-rendered all 57 routes. The standalone server, assembled as the Dockerfile does,
  served pages, returned 404 and 410 correctly, blocked indexing and saved an inquiry through the API.
- **Backend:** the image's start command (`alembic upgrade head && python -m app.seed`) on a brand-new
  database created the schema and seeded 10 services, 3 categories, 30 products and 3 redirects; a second
  start inserted nothing.

Run `docker compose up --build` once on the target server before launch.

## Not verified here (needs production or owner access)

- Official structured-data validators (Google Rich Results Test, validator.schema.org) were blocked
  by this environment's network policy. Run them on the live URLs after launch.
- Real-user Core Web Vitals (CrUX / Search Console), which need traffic.
- TLS, DNS, `www` → apex and `http` → `https` redirects through the real reverse proxy.
  `CANONICAL_HOST` and `ENFORCE_HTTPS` are implemented but were not exercised behind a real proxy.
- Telegram and email notification delivery, which needs real credentials.
- Search Console, Google Business Profile and analytics setup (see `owner-launch-checklist.md`).
- Testing on physical iOS and Android devices and in Safari or Firefox; automated runs used Chromium.
