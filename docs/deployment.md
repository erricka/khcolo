# Deployment

## What the site needs to run

The site is a **Next.js server**, not a folder of static files. It needs Node.js 22 (or the
Docker image) for four reasons:

1. **Incremental static regeneration.** Pages are pre-rendered at build time, then regenerated in
   the background every hour and immediately when the API calls `/api/revalidate/` after an edit.
2. **Redirects and URL hygiene.** `proxy.ts` collapses doubled slashes, answers removed URLs with
   410, and can enforce the canonical host and HTTPS. `next.config.ts` holds the 308 redirect map.
3. **The inquiry route.** `/api/inquiry/` forwards the contact form to the private API with the
   visitor's IP for rate limiting.
4. **Image optimisation.** `/_next/image` serves AVIF/WebP at the right size.

A static export (`output: "export"`) would lose all four. Any host that runs a Node process
works: a VPS with Docker (below), or a managed Node platform. The FastAPI service and PostgreSQL
should stay on a private network; only the Next.js server talks to them.

```
Internet ─▶ reverse proxy (TLS) ─▶ web :3000 (Next.js) ─▶ api :8000 (FastAPI) ─▶ db :5432
```

## Render (recommended managed option)

`render.yaml` at the repository root is a Render Blueprint. It creates, in the Singapore region
(closest to Cambodia):

| Resource | Type | Plan in the Blueprint | Notes |
| --- | --- | --- | --- |
| `khcolo-db` | PostgreSQL 16 | `basic-256mb` | No public access |
| `khcolo-api` | Private service (Python) | `starter` | FastAPI; no public URL, reachable only from the website |
| `khcolo-web` | Web service (Node 22) | `starter` | The public website, `https://khcolo-web.onrender.com` |

At Render's published prices that is roughly US$20 a month. Check current pricing on render.com.

**Deploy it:**

1. Sign in at [dashboard.render.com](https://dashboard.render.com) and connect your GitHub account.
2. **New → Blueprint**, choose `erricka/khcolo`, branch `main`.
3. Render shows the three resources. Leave `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` empty for now,
   or paste a bot token and chat ID to get inquiry alerts. Click **Apply**.
4. The first deploy takes a few minutes. The API migrates and seeds the database on each deploy
   (insert-only), then the website comes up at `https://khcolo-web.onrender.com`.

Render generates `ADMIN_API_TOKEN`, `IP_HASH_SALT` and `REVALIDATE_SECRET`, and shares the secret
between the two services. Every push to `main` that touches `frontend/`, `backend/` or `content/`
redeploys the affected service.

**It starts as a private staging site.** `SITE_ENV=development` means robots.txt blocks crawling and
every page sends `noindex`, so the old site keeps its rankings while you review. To go live:

1. In `khcolo-web` → **Settings → Custom Domains**, add `khcolo.com` and `www.khcolo.com` and create
   the DNS records Render shows. Render issues the certificates and redirects HTTP to HTTPS.
2. In `khcolo-web` → **Environment**, set `SITE_ENV=production` and `CANONICAL_HOST=khcolo.com`, then
   **Manual Deploy → Clear build cache & deploy** (both values are read at build time).
3. Work through `docs/owner-launch-checklist.md`.

**Reading inquiries.** The API is private, so use the API service's **Shell** tab:

```bash
curl -s -H "Authorization: Bearer $ADMIN_API_TOKEN" "http://localhost:$PORT/api/v1/admin/inquiries?status=new"
```

Configure Telegram or email alerts (above) so nobody has to poll.

**Cheaper or free.** Render's free web services sleep after 15 minutes idle (the first visit then
takes up to a minute), free databases expire after 30 days, and private services are not available
on the free plan. For a business site, keep the paid plans.

### The free-tier setup currently running

The staging site was created on Render's free tier (Singapore) with three resources:

| Resource | URL / ID | Notes |
| --- | --- | --- |
| `khcolo-db` | `dpg-dbkmhvrncjis73eolau0-a` | Free PostgreSQL 16. **Expires 3 Dec 2026** unless upgraded. |
| `khcolo-api` | `https://khcolo-api.onrender.com` | Public web service, locked with `INTERNAL_API_KEY`: every `/api` call except `/api/v1/health` returns 404 without the key. |
| `khcolo-web` | `https://khcolo-web.onrender.com` | The website, `SITE_ENV=development` (not indexed). |

How it differs from the Blueprint:

- The API is a public web service (free plans have no private services), so the website sends
  `X-Internal-Key` on every call and the visitor IP in `X-Client-IP`. Both services share
  `INTERNAL_API_KEY` and `REVALIDATE_SECRET`; change them together if you rotate them.
- Migrations and seeding run in the API's start command (free plans have no pre-deploy step).
- Both services sleep when idle. The inquiry form waits up to 75 seconds for the API to wake.

**Upgrading to always-on:** in the Render dashboard change `khcolo-web` and `khcolo-api` to
**Starter** and `khcolo-db` to **Basic** (before it expires). Nothing else changes. Alternatively,
delete the three free resources and apply `render.yaml` as a Blueprint for the private-API setup.

**Reading inquiries on the free setup:** from the API service's **Shell** tab:

```bash
curl -s -H "X-Internal-Key: $INTERNAL_API_KEY" -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  "http://localhost:$PORT/api/v1/admin/inquiries?status=new"
```

## Single server with Docker Compose

```bash
git clone <repo> khcolo && cd khcolo
cp .env.example .env
# Generate secrets, e.g.  openssl rand -hex 32
#   POSTGRES_PASSWORD, REVALIDATE_SECRET, ADMIN_API_TOKEN, IP_HASH_SALT
docker compose up -d --build
docker compose logs -f api web
```

On start the API runs `alembic upgrade head` and `python -m app.seed` (insert-only: rows edited
through the admin API are never overwritten). Set `SEED_OVERWRITE=1` for one deploy to reset the
database to the JSON files instead; see `docs/content-editing.md`. The web image is built from the JSON content and
refreshes from the API after start-up.

### Staging vs production

`SITE_ENV` is read **at build time**. Anything other than `production` produces a robots.txt that
disallows all crawling and adds `X-Robots-Tag: noindex, nofollow` to every response, so a staging
copy can never be indexed. For launch, set in `.env`:

```bash
SITE_ENV=production
NEXT_PUBLIC_SITE_URL=https://khcolo.com
CANONICAL_HOST=khcolo.com
ENFORCE_HTTPS=true
```

then rebuild the web image: `docker compose up -d --build web`.

### Reverse proxy (Caddy example)

```caddy
khcolo.com {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3000
}

www.khcolo.com {
    redir https://khcolo.com{uri} permanent
}
```

Caddy obtains certificates automatically and sends `X-Forwarded-For` and `X-Forwarded-Proto`, which
the site uses for rate limiting and the HTTPS redirect. The site takes the right-most
`X-Forwarded-For` entry (the one your proxy adds), so visitors cannot spoof it. With nginx, set the same two headers.
Do **not** publish port 8000 or 5432.

## Environment variables

### Website (`frontend`)

| Variable | When | Purpose |
| --- | --- | --- |
| `SITE_ENV` | build | `production` allows indexing. Default `development` blocks it. |
| `NEXT_PUBLIC_SITE_URL` | build | Origin for canonicals, sitemap, Open Graph and JSON-LD. |
| `KHCOLO_API_URL` | build + run | FastAPI base URL from the server's point of view, e.g. `http://api:8000` or a bare `host:port`. When unset, pages are built from `/content`. |
| `KHCOLO_CONTENT_DIR` | run | Location of `/content` when the API is not used (the Docker image sets it). |
| `REVALIDATE_SECRET` | run | Must match the API's value; protects `/api/revalidate/`. |
| `INTERNAL_API_KEY` | build + run | Sent as `X-Internal-Key` on every API call. Must match the API's value when it requires one. |
| `CANONICAL_HOST` | run | Redirect any other host (e.g. `www.`) here with 308. Leave empty locally. |
| `ENFORCE_HTTPS` | build + run | `true` redirects `http` to `https` (from `X-Forwarded-Proto`) and sends HSTS. |

### API (`backend`)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | `postgresql+psycopg://user:pass@host:5432/db` (plain `postgres://` / `postgresql://` URLs from hosting platforms are accepted) |
| `ENVIRONMENT` | `production` hides `/api/docs` and the OpenAPI schema. |
| `ADMIN_API_TOKEN` | Bearer token for `/api/v1/admin/*`. Unset = admin API disabled. |
| `INTERNAL_API_KEY` | When set, every `/api` request except `/api/v1/health` needs `X-Internal-Key`; others get 404. Set it whenever the API has a public URL. |
| `TRUST_PROXY_HEADERS` | `true` only when the API is reachable solely through the Next.js server. |
| `IP_HASH_SALT` | Salt for the one-way IP hash used in rate limiting. |
| `INQUIRY_RATE_LIMIT`, `INQUIRY_RATE_WINDOW_MINUTES`, `INQUIRY_GLOBAL_HOURLY_LIMIT` | Abuse limits (defaults 5 per 10 minutes per client, 120 per hour overall). |
| `FRONTEND_REVALIDATE_URL`, `REVALIDATE_SECRET` | Where to send the regeneration webhook after admin edits. |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Optional Telegram alert for each inquiry. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`, `NOTIFY_EMAIL_TO` | Optional email alert for each inquiry (STARTTLS). |
| `CONTENT_DIR` | Seed source; the Docker image sets `/app/content`. |
| `SEED_OVERWRITE` | `1` makes the start-up seed behave like `--overwrite` (reset content to the files, unpublish removed rows). Use for one deploy, then remove. |

Notifications are attempted after the inquiry is saved. Each inquiry records
`notification_status`: `disabled` (nothing configured), `sent`, `partial` or `failed`. A failed
alert never loses a request.

## Without Docker

```bash
# API
cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/alembic upgrade head && .venv/bin/python -m app.seed
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2

# Site (build with the API running so pages are rendered from the database)
cd frontend && npm ci
SITE_ENV=production NEXT_PUBLIC_SITE_URL=https://khcolo.com KHCOLO_API_URL=http://127.0.0.1:8000 npm run build
cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public
cd .next/standalone && PORT=3000 KHCOLO_API_URL=http://127.0.0.1:8000 REVALIDATE_SECRET=... node server.js
```

Run both under a process manager (systemd, pm2) and put the reverse proxy in front.

## Operations

- **Backups.** Inquiries exist only in PostgreSQL. Back up the `pgdata` volume or run
  `pg_dump` nightly, and test a restore.
- **Migrations.** `alembic upgrade head` runs on API start. For schema changes, add a revision in
  `backend/alembic/versions/`.
- **Rate limiting across several API instances** works as-is: it counts recent rows in PostgreSQL.
- **Hardening to consider:** a Content-Security-Policy (add your analytics domains),
  fail2ban or a WAF in front of the proxy, and log retention that avoids storing full IPs.
