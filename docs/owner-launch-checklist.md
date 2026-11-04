# Owner launch checklist

Steps that need KHCOLO's own accounts, decisions or access. None of these were (or could be)
completed from the code.

## Before launch

- [ ] Work through [`content-review.md`](content-review.md): partner status, 24/7 wording,
      conflicting product specs, legacy model availability, plan names, image rights.
- [ ] Have the privacy notice reviewed, including how long inquiries are kept.
- [ ] Decide who reads inquiries and set up at least one alert: a Telegram bot
      (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) or email (`SMTP_*`, `NOTIFY_EMAIL_TO`). Send a test
      inquiry and confirm it arrives.
- [ ] Generate long random values for `POSTGRES_PASSWORD`, `ADMIN_API_TOKEN`, `REVALIDATE_SECRET`,
      `IP_HASH_SALT` and store them in a password manager.
- [ ] Deploy to a staging address with `SITE_ENV=development` and review every page on a phone.
- [ ] Compare the old site's URLs against [`page-inventory.md`](page-inventory.md). If you can
      export the full list (WordPress export or Search Console → Pages), check for URLs not in the
      inventory and decide: redirect to a real equivalent, or let them 404/410. Never redirect
      everything to the homepage.
- [ ] Set up nightly PostgreSQL backups and test one restore.

## Launch day

- [ ] Set `SITE_ENV=production`, `CANONICAL_HOST=khcolo.com`, `ENFORCE_HTTPS=true`, rebuild the web
      image and deploy.
- [ ] Point DNS for `khcolo.com` and `www.khcolo.com` at the new server; confirm `www` and `http`
      both 308 to `https://khcolo.com/`.
- [ ] Spot-check: `/robots.txt` allows crawling and lists the sitemap; `/sitemap.xml` lists 48 URLs;
      `/product/yealink-sip-t46u-ip-phone-2/` redirects; `/feed/` returns 410.
- [ ] Submit one real inquiry from a phone and confirm staff receive it.

## Google Search Console

- [ ] Verify the **Domain property** `khcolo.com` (DNS TXT record) so `http`, `https` and `www` are
      all covered.
- [ ] Before switching DNS, record a baseline: Performance (queries, clicks, impressions, CTR,
      position) for the last 3 months, and the Pages report.
- [ ] Submit `https://khcolo.com/sitemap.xml`.
- [ ] Use **URL Inspection → Test live URL** on the homepage, one service, one category and one
      product. Request indexing for the homepage and key service pages.
- [ ] Check the **Enhancements** and Rich Results Test for Breadcrumbs, Organization and Product.
      Product snippets will not show prices because no prices are published (by design).
- [ ] Revisit after 2, 4 and 8 weeks: Pages (indexed vs not indexed and why), Performance by page
      and query, Core Web Vitals once there is enough field data.

## Google Business Profile

Local ranking depends mostly on relevance, distance and prominence, and the profile matters more
than anything on the website for "near me" searches.

- [ ] Claim or verify the profile with the exact business name **KHCOLO**.
- [ ] Choose accurate categories (for example "Computer support and services", "Website hosting
      service"; pick what truly applies). Avoid telecom categories: KHCOLO is not registered with TRC
      or MPTC.
- [ ] Location: if customers visit an office, add the real address. If you only serve customers at
      their premises, hide the address and set the **service area** to Cambodia, as on the website. Do not add addresses that aren't real offices.
- [ ] Hours: office hours only. Describe any 24/7 technical support in the description, and only
      if contracts include it.
- [ ] Phone `+855 12 200 259`, website `https://khcolo.com/`, Telegram link in the description.
- [ ] Add genuine photos: the team, installations you're allowed to show, the office.
- [ ] Ask real customers for reviews and reply to them. Never buy reviews or links.
- [ ] Once an address is confirmed and public, add a `LocalBusiness` subtype to the structured data
      (see `frontend/src/lib/seo.ts`) using exactly the same name, address and phone.

## Analytics and conversions

- [ ] Add Google Tag Manager or GA4 if you want measurement (and add its domains to any CSP).
- [ ] The site already pushes these events to `window.dataLayer`, with no personal data:
      - `contact_click` with `method` = `telegram` / `phone` / `email` and `location`
      - `quote_click` (product "Request a quote" buttons)
      - `inquiry_submitted` with `request_type` and `interest`, only after the API confirms the save
- [ ] Mark `inquiry_submitted` and `contact_click` as key events (conversions).

## Language versions

Only English pages exist, so no `hreflang` is output. If you publish reviewed Khmer translations
later, add them under `/km/…` with matching `hreflang` pairs. Never point both language alternates at
the same untranslated page.
