# Editing content

There are two ways to change what the site says. Both keep the HTML, metadata, structured data and
sitemap in step, because every one of those is generated from the same records.

## 1. Edit the JSON files (best for bigger changes)

| File | Holds |
| --- | --- |
| `content/company.json` | Contact details, socials, partner programs, principles, solution groups |
| `content/services.json` | The 10 service pages: copy, capabilities, options, process, FAQs, related links, SEO |
| `content/categories.json` | The 3 product categories |
| `content/products.json` | The 30 products: specs, accessories, public notes, image, SEO |
| `content/pages.json` | Title, description and H1 for the home, about, contact, products and privacy pages |
| `content/redirects.json` | 308 redirects and 410 (removed) URLs |

Each service and product has a `review` block (`status` plus `notes`) and source URLs. These are
**private**: the API and the site strip them before anything reaches a browser. Use them to record
why something was worded cautiously, then clear the note and set `"status": "approved"` once the
owner confirms.

After editing:

```bash
cd backend && .venv/bin/python -m app.seed --overwrite   # push the JSON into PostgreSQL
python3 scripts/build_docs.py                             # refresh the inventory and review list
curl -X POST -H "Authorization: Bearer $ADMIN_API_TOKEN" http://127.0.0.1:8000/api/v1/admin/revalidate
```

`--overwrite` resets every content row to the files, including anything changed through the admin
API, and unpublishes services, categories and products that are no longer in the files (their old
URLs should get a redirect in `redirects.json`). Without it, the seed only adds what is missing.

On Render, where you can't run the command by hand on the free plan, set `SEED_OVERWRITE=1` on
`khcolo-api`, let it redeploy once, then delete the variable so later deploys go back to insert-only.

Guidelines that keep the site trustworthy and searchable:

- Keep meta descriptions roughly 140–160 characters and titles under about 60.
- Never add prices, stock, ratings, testimonials, customer names or statistics that the owner has not
  confirmed. The brief is explicit about this, and Product markup must stay truthful.
- Keep each fact attached to the vendor it belongs to (e.g. "Gold Partner" is 3CX only).
- New products need a 800×800 image in `frontend/public/images/products/<slug>.webp` (see below).

## 2. The admin API (small edits without a deploy)

All admin endpoints need `Authorization: Bearer <ADMIN_API_TOKEN>`. Interactive docs are at
`/api/docs` on a non-production API.

```bash
API=http://127.0.0.1:8000/api/v1
AUTH="Authorization: Bearer $ADMIN_API_TOKEN"

# Inquiries: list, then mark one handled
curl -H "$AUTH" "$API/admin/inquiries?status=new"
curl -X PATCH -H "$AUTH" -H 'content-type: application/json' \
     -d '{"status":"closed"}' "$API/admin/inquiries/<id>"

# Everything still awaiting confirmation
curl -H "$AUTH" "$API/admin/review"

# Fix the TG400 channel count once confirmed, and approve the page
curl -X PATCH -H "$AUTH" -H 'content-type: application/json' "$API/admin/products/yeastar-neogate-tg400-gsm-gateway" \
     -d '{"specs":[{"label":"Channels","value":"4 × GSM"}, ...], "reviewStatus":"approved", "reviewNotes":[]}'

# Change a service summary
curl -X PATCH -H "$AUTH" -H 'content-type: application/json' "$API/admin/services/proxmoxve" \
     -d '{"summary":"..."}'

# Hide a page (it disappears from navigation, sitemap and returns 404)
curl -X PATCH -H "$AUTH" -H 'content-type: application/json' "$API/admin/services/proxmoxve" -d '{"isPublished":false}'
```

Each content edit triggers the site's revalidation webhook, so the updated page, related pages and
the sitemap regenerate within seconds. `specs` replaces the whole specification list, so send every
row.

Admin edits live in the database. Mirror important ones back into `/content` so a future
`--overwrite` seed doesn't undo them.

## Images

Product photos are 800×800 WebP files on a white background with the product filling about 88%
of the frame. The site places them on a warm grey panel using `mix-blend-mode: multiply`, so the
white disappears. To add or replace one, export a square PNG/JPG with a white background and
convert it (any tool works):

```bash
cwebp -q 84 input.png -resize 800 800 -o frontend/public/images/products/<slug>.webp
```

Then set `image.src`, `image.alt` (describe the product, e.g. "Yeastar S20 desktop IP PBX") and
`image.sourceUrl` in `products.json`. Confirm you have the right to use the photo.

The logo lives in `frontend/src/components/brand/Logo.tsx` (inline SVG path, inherits text colour)
and `frontend/public/brand/`. Replace the path data if a master vector logo is supplied.

## Copy that lives in components

A few short pieces of interface copy are in the components rather than the database: the homepage
hero and "How we work" steps (`src/app/page.tsx`), the About page story (`src/app/about-us/page.tsx`),
the privacy notice (`src/app/privacy-policy/page.tsx`) and the contact band. Edit those files and
redeploy.
