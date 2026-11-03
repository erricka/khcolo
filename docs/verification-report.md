# Verification report

Checks run on 3 November 2026 against a production build (`next build`, standalone server) reading
content from the FastAPI service and PostgreSQL 16, unless noted. Everything listed as passed was
run and observed; checks that need production infrastructure or owner accounts are listed at the
end.

## Summary

| Area | Result |
| --- | --- |
| API test suite (`pytest`, 23 tests, real PostgreSQL) | 23 passed |
| TypeScript (`tsc --noEmit`) and production build | Clean, no warnings; 57 routes pre-rendered |
| No-JS crawl of all 48 sitemap URLs | 48 × 200, one H1 each, self-canonical, 145–160 char descriptions, OG image, valid JSON-LD |
| Internal links found in HTML | 48 unique, none broken |
| Redirects / status codes | All 9 edge cases as expected (below) |
| Structured data (offline structural check) | 96 blocks across 48 pages, 0 issues |
| Browser checks (Playwright, Chromium) | 19 of 19 passed (first design); 22 of 22 after the redesign |
| Lighthouse (lab) | Accessibility, Best Practices and SEO 100 on every run; Performance 94–97 mobile, 100 desktop after the redesign |

## Redesign re-verification (Render-style light design)

The site was restyled after launch review: white canvas, hairline cell grids, light display type,
mono labels, square black buttons with a blue chevron block, a two-tone logo redrawn from the
original artwork, and no dark sections. These checks were re-run on 3 November 2026 against a
production build made with `SITE_ENV=production`, as on Render.

| Check | Result |
| --- | --- |
| `tsc --noEmit` and `next build` | Clean; 57 routes |
| API tests (`pytest`, real PostgreSQL) | 23 passed |
| No-JS crawl of the 48 sitemap URLs | 48 × 200, one H1 each, title, 50+ char description, self-canonical, no `undefined`/`NaN` |
| Internal links in HTML | 51 unique, all 200 or the planned 308 |
| Home title and H1 contain "3CX" and "Bitrix24"; Organization and WebSite JSON-LD present | Yes |
| Unknown URL | 404 |
| Horizontal overflow and text clipped past the viewport edge, 9 templates at 360, 390, 768, 1024, 1440 px | None |
| Console or page errors on those 9 templates at all five widths | None |
| Solutions mega menu: opens with Enter, closes with Escape | Yes |
| Mobile drawer: focus moves inside, Escape closes it | Yes |
| Primary button hover: the blue block wipes across the whole button | Yes (`clip-path: inset(0)`) |
| Reduced motion: marquee, caret, floating tiles, sparklines, pulses and travelling dots stopped; every reveal block visible after scrolling | Yes |
| JavaScript disabled: every reveal block visible | Yes |
| Empty inquiry: error summary shown, 5 fields marked `aria-invalid` | Yes |

Lighthouse 12.8.2, mobile defaults (Moto G Power emulation, slow 4G, 4× CPU) unless marked desktop:

| Page | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| home (run 1) | 94 | 100 | 100 | 100 | 1.7 s | 2.9 s | 40 ms | 0 |
| home (run 2) | 95 | 100 | 100 | 100 | 1.7 s | 2.9 s | 50 ms | 0 |
| home, desktop | 100 | 100 | 100 | 100 | — | 0.5 s | 10 ms | 0 |
| 3CX + Bitrix24 service | 96 | 100 | 100 | 100 | 1.5 s | 2.8 s | 50 ms | 0 |
| IP phones category | 94 | 100 | 100 | 100 | 1.5 s | 3.0 s | 60 ms | 0 |
| Yealink SIP-T46U product | 95 | 100 | 100 | 100 | 0.9 s | 2.7 s | 130 ms | 0 |
| contact | 97 | 100 | 100 | 100 | 1.5 s | 2.5 s | 60 ms | 0 |
| about, desktop | 100 | 100 | 100 | 100 | — | 0.5 s | 0 ms | 0 |

Changes made because of these measurements:

- The first build had TBT of 520 ms on mobile. Two decorative loops were repainting every frame: the
  status pulse animated `box-shadow` and the travelling dots animated `top`. Both now animate only
  `transform` and `opacity`, which brought TBT to 40–130 ms.
- Small mono labels inside the hero illustration were 3.2:1 on white. They now use a darker grey that
  meets 4.5:1.
- IBM Plex Mono now loads one weight, without a preload, so it no longer competes with Inter and the
  stylesheet on the critical path.
- On phones the platform band's heading ran past the screen edge because the marquee's width
  stretched its grid column. The column is now `minmax(0, 1fr)`, and the browser checks now also look
  for text clipped past the viewport.

The earlier table below was measured with Lighthouse 13.6 on the first design. The two versions
model throttling differently, so compare the tables loosely.

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
