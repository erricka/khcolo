# khcolo.com

The rebuilt website for KHCOLO, a Cambodian IT solutions company: phone systems, CRM,
cybersecurity, backup, hosting and IT maintenance, plus a quote-only hardware catalog.

| Layer | Stack |
| --- | --- |
| Website | React 19, Next.js 16 (App Router, TypeScript), Tailwind CSS 4, Motion for React |
| API | Python 3.13, FastAPI, SQLAlchemy 2, Alembic, Pydantic 2 |
| Database | PostgreSQL 16 |

Every public page is pre-rendered to HTML at build time and refreshed by incremental static
regeneration (hourly, or immediately after a content edit). Search engines and visitors without
JavaScript get the full content, metadata and structured data in the first response.

## Design and motion

A light, engineered look in the manner of render.com: a white canvas, hairline cell grids, large
light-weight Inter headlines, IBM Plex Mono for small uppercase labels, square corners, black buttons
with a blue chevron block that wipes across on hover, and blue pixel blocks sitting in the grid.
Colour comes from the logo, royal blue with the logo's navy for the darkest brand tone, and a little
green is kept for status and confirmation. The logo is redrawn as vectors from the original artwork
in its two colours (`frontend/src/components/brand/Logo.tsx`), and the product photography is real.
Tokens (colour, type scale, radius, easing, durations) live in `frontend/src/app/globals.css`.

Motion is layered so it never costs content or speed:

- **CSS first.** Hero entrances, a connector that draws into the hero panel, live-looking
  sparklines, the platform-tile marquee, floating tiles around the closing call to action, section
  reveals (with a soft blur on headings), the reading-progress line (CSS scroll timelines) and the
  button wipe. Looping effects animate only `transform` and `opacity`.
- **Motion for React** (loaded lazily via `LazyMotion`) for menus, the mobile drawer, accordions,
  the catalog's layout animation, the section-nav indicator and form states.
- **Small delegated listeners** for the cursor spotlight on cards.
- Content is never hidden if JavaScript fails (a fail-safe removes reveal styles), decorative loops
  pause off screen, and `prefers-reduced-motion` turns movement off everywhere.

```
content/     Source content: company, 10 services, 3 categories, 30 products, page SEO, redirects
backend/     FastAPI app, Alembic migration, seed script, tests
frontend/    Next.js site (src/app routes, src/components, src/lib)
docs/        Page inventory, content review list, deployment, editing, launch checklist, verification
scripts/     build_docs.py regenerates the inventory and review list from /content
```

## How content flows

```
content/*.json ──seed──▶ PostgreSQL ◀── FastAPI (/api/v1) ◀── Next.js server ──▶ HTML
                                  ▲                                   ▲
                    admin edits (token) ── revalidation webhook ──────┘
```

The JSON files are the starting inventory. `python -m app.seed` loads them into PostgreSQL;
after that, the database is the source of truth and the site reads it through the API. If
`KHCOLO_API_URL` is not set, the site reads the JSON files directly, which is handy for design work
and CI. Private review notes in the JSON are never sent to the browser in either mode.

## Run it locally

You need Node 22+, Python 3.12+ and PostgreSQL 16.

```bash
# 1. Database
createuser khcolo --pwprompt        # password: khcolo-dev-only (or change backend/.env)
createdb -O khcolo khcolo
createdb -O khcolo khcolo_test

# 2. API
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
cp .env.example .env
.venv/bin/alembic upgrade head
.venv/bin/python -m app.seed
.venv/bin/uvicorn app.main:app --reload --port 8000      # docs at http://127.0.0.1:8000/api/docs

# 3. Website (new terminal)
cd frontend
npm ci
cp .env.example .env.local
npm run dev                                               # http://localhost:3000
```

Hosting on Render: `render.yaml` is a ready Blueprint (database, private API, website). See
[docs/deployment.md](docs/deployment.md#render-recommended-managed-option).

Or with Docker:

```bash
cp .env.example .env    # fill in the secrets
docker compose up --build
```

## Tests and checks

```bash
cd backend && .venv/bin/python -m pytest      # 21 API tests against khcolo_test
cd frontend && npm run typecheck && npm run build
```

`docs/verification-report.md` lists every check that was run before handover and its result.

## Documentation

- [Deployment](docs/deployment.md): rendering requirements, environment variables, reverse proxy, backups
- [Editing content](docs/content-editing.md): JSON seed files, the admin API, images, review workflow
- [Page inventory](docs/page-inventory.md): every URL with title, description, H1, schema and indexability
- [Content review list](docs/content-review.md): facts the owner must confirm
- [Owner launch checklist](docs/owner-launch-checklist.md): DNS, Search Console, Google Business Profile, analytics
- [Verification report](docs/verification-report.md): what was tested and what still needs production access
