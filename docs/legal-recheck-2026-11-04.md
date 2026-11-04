# Content and Cambodia legal recheck, 4 November 2026

**Status:** implementation guidance and open owner/legal questions. This is not a certificate of
legal compliance. A website content review cannot confirm compliance with all Cambodian law or
KHCOLO's actual permission status.

**Where the change lives:** branch `review/legal-recheck-2026-11-04`, fast-forwarded into `main`
and **published on 4 Nov 2026 at 08:17 UTC (`aa9e4af`)** after the owner approved it, relayed by
the requester ("Publish now"). No pull request was opened. Cambodian counsel has not reviewed it
yet; the legal questions below remain open.

**Live sites:**

- https://khcolo-web.onrender.com now serves this review: 3CX configuration and Bitrix24 CRM only,
  no hosting, hardware, partner tiers or "across Cambodia". Retired URLs answer 410 + noindex.
  The live database was reconciled the same minute (see "Live database" below).
- The preview services https://khcolo-web-previous.onrender.com and
  https://khcolo-web-white.onrender.com show the earlier designs: Acronis, Zimbra, "Since 2017",
  "telecom partner" and hardware. They send `noindex` but are publicly reachable. Remove or
  suspend them in Render once the design comparison is over.
- https://khcolo.com (WordPress) is not deployed from this code. See "Original khcolo.com" below.

**Disclosure:** earlier on 4 Nov 2026, before this recheck, the live API database was reset to the
content files three times through `SEED_OVERWRITE=1` (02:35, 02:42 and 02:51 UTC). Acronis and
Zimbra were unpublished at 02:35. The database had been seeded from the same files the day
before. No editor changes were known to exist, but that was a blanket overwrite of content rows.
`SEED_OVERWRITE` is now `0`. No database change has been made since.

The supplied PDF (`20261102_Presentaton_CoC_Validation_WS_V2.pdf`) was not available in this
session. It is treated as a draft code of conduct, as described in the brief. Nothing in it is
cited as an enacted requirement.

## What the patch does

- **One publication switch:** `content/publication.json`.
  - Public services: `cloud-call-center` (3CX) and `3cx-bitrix24-integration` (Bitrix24) only.
  - Products and categories: archived.
  - Editorial lock: on.
- **Content loader:** `frontend/src/lib/content.ts`.
  - While the lock is on, company, page and service copy is read from the reviewed JSON files even
    when `KHCOLO_API_URL` is set.
  - Hidden services return `null`, so their routes give 404.
  - Product and category getters return nothing.
- **Routing:** `frontend/next.config.ts` and `frontend/src/proxy.ts`.
  - Every hidden service, category and product URL, the old WordPress-only URLs and
    `/images/products/*` answer **410 Gone**. The response is plain text with
    `X-Robots-Tag: noindex` and no links.
  - Redirects that pointed into hidden content (Acronis, Zimbra, the duplicate T46U) are now 410.
    Nothing redirects to the homepage.
  - The image optimiser serves only `/brand/**` and `/og/**`.
- **Copy:**
  - 3CX is described as configuration of the customer's 3CX. Calls, phone numbers and connectivity
    are "supplied separately by your authorized provider", with no carrier named.
  - The "managed cloud server" option is removed. 3CX runs in the customer's own cloud account or
    on-premise. The 3CX page states it directly: "KHCOLO does not host 3CX or provide server
    hosting." The customer opens and pays for the cloud account; KHCOLO installs and configures 3CX
    in it.
  - Bitrix24 is unchanged apart from removing the Twilio and RingCentral integrations and tying
    "Telephony" to the customer's 3CX.
  - No partner tiers, hardware, hosting, security or maintenance offers, "nationwide" or years.
  - Phnom Penh and Siem Reap are shown as **project areas, by agreement**.
  - The hero panel and call-flow diagram are labelled as examples ("Illustration · not live data").
- **Navigation:** direct links to the two services. No Products or Solutions menus. The footer
  lists Services and Company only. The 404 page links only to public pages. The inquiry topics are
  the two services plus "Something else"; the hardware topic and product picker are gone.
- **SEO:**
  - New titles, descriptions and keywords.
  - The Organization and Service data use `areaServed: City` for Phnom Penh and Siem Reap.
  - `knowsAbout` is limited to 3CX and Bitrix24.
  - The sitemap lists the six public URLs.
  - The share image is regenerated without "Gold Partner" or "Security · Cloud".
- **Privacy notice:**
  - The product field is removed.
  - It says the database runs with a third-party hosting provider.
  - It lists exactly what a notification sends: name, company, email, phone and message.
  - It says inquiries are not deleted automatically.
- **Archived data corrections (not public):**
  - T48U display 800 × 480.
  - W56H/W60P spare battery is optional and not included.
  - TG400 dimensions withheld as ambiguous.
  - ESET Password Manager removed (end of new sales).
  - GlusterFS removed from Proxmox VE (VE 9).
- **Database tool:** `python -m app.reconcile` (dry run by default, `--apply` to write) updates only
  the reviewed rows and fields. It is tested in `backend/tests/test_reconcile.py`. It has not been
  run against the live database.

## Page-by-page result

Tested 4 Nov 2026 on local production builds of this branch (`SITE_ENV=production`):

- **File-backed:** as Render builds.
- **API-backed:** against a local PostgreSQL copy seeded with the live content (`2f05123`) plus
  today's insert-only seed.

Both builds gave identical results for every URL.

| URL | Finding before | Source | Edit | Test result | Owner / counsel decision |
| --- | --- | --- | --- | --- | --- |
| `/` | "local IT support"; Gold Partner; hardware section; security/hosting/maintenance cells; vendor tiles (Yealink, Yeastar, ESET, cPanel, Proxmox); "across Cambodia"; live-looking dashboard | `content/pages.json`, `content/company.json`, `frontend/src/app/page.tsx`, `components/home/*`, `components/ui/ContactBand.tsx` | Rewritten for 3CX configuration and Bitrix24 only; example labels; PP/SR by agreement; provider sentence | 200, one H1, Organization + WebSite JSON-LD (City), no banned terms, no links to hidden URLs, desktop and mobile checked | Confirm the wording "authorized provider"; confirm PP/SR staffing |
| `/about-us/` | "full stack", security/hosting/maintenance, partner tiers, "Cambodia with on-site installation" | `app/about-us/page.tsx`, `company.json` | Phone system and CRM only; "Platforms we configure" without tiers; project areas | 200, AboutPage JSON-LD, clean scan | Supply legal entity name, registration and address if they should appear |
| `/contact-us/` | Hardware topic and product picker; "an engineer will reply" | `app/contact-us/page.tsx`, `InquiryForm.tsx` | Two service topics + "Something else"; no product field | 200, ContactPage JSON-LD, clean scan. **No form was submitted** | Confirm production notification channels (Telegram/email), access and retention |
| `/privacy-policy/` | Mentioned product field and "our own database"; retention vague | `app/privacy-policy/page.tsx` | Matches code: fields stored, IP hash, user-agent, notification content, hosting provider, no automatic deletion | 200, clean scan | Provide controller entity/address, hosting and data location, retention period, and a process for correction/deletion requests; add consumer terms from owner records |
| `/cloud-call-center/` | "supplies, hosts", hosted option, "supply Yealink phones", related hardware categories, SIP trunk supplied | `content/services.json` | "3CX Phone System Configuration"; own cloud or on-premise; provider supplies calls/numbers/connectivity; no hardware links | 200, Service JSON-LD (City), clean scan (only "live chat" as a feature name) | Counsel: does 3CX configuration, licence resale or trunk configuration need a TRC/MPTC permit? |
| `/3cx-bitrix24-integration/` | Twilio/RingCentral integrations; related links to hidden services | `content/services.json` | Removed; related link only to 3CX | 200, Service JSON-LD, clean scan | Confirm "3CRM" in the owner's message means Bitrix24 CRM, and the licence entitlement |
| `/voice-communication/`, `/eset-antivirus/`, `/web-security/`, `/cloud-services/`, `/proxmoxve/`, `/it-maintenance/` | Hardware/AV, security, hosting/VPS, maintenance offers | `content/services.json` | Archived; 410 | 410 + noindex; not in sitemap, menus, footer, related cards or topics | Decide which, if any, return after permits and evidence |
| `/acronis-cyber-protect-cloud/`, `/zimbra/` | Previously 308 to IT Maintenance / Hosting | `content/redirects.json` | 410 (target archived) | 410 + noindex | — |
| `/products/`, `/product-category/{ip-phone,voip-gateway,ip-pbx}/`, 30 × `/product/…/`, `/product/yealink-sip-t46u-ip-phone-2/` | Telecom hardware listings | `content/products.json`, `categories.json` | Archived; 410; product photos 410 | 410 + noindex (33 URLs + images) | TRC permits, type approvals, import channel, stock, vendor rights before any reintroduction |
| `/professional-business-email/`, `/geotrust-ssl-certificates/`, `/comodo-ssl-certificates/`, `/video-conference/`, `/home-product/` | Old WordPress-only URLs | `content/publication.json` | 410 | 410 + noindex | — |
| `/feed/`, `/comments/feed/` | WordPress feeds | `redirects.json` | 410 (unchanged) | 410 + noindex | — |
| `/sitemap.xml` | Listed 46 URLs including hardware | `app/sitemap.ts` | Six public URLs | Clean | — |
| `/robots.txt` | — | `app/robots.ts` | Unchanged (allows `/`, disallows `/api/` in production) | OK | — |
| Unknown URL | — | `app/not-found.tsx` | Links only to the two services and Contact | 404 with `noindex` | — |

Totals: 57 URLs checked: the 49 previous-redesign URLs, the 52 original khcolo.com URLs, the feeds
and a product image path, with duplicates removed. 6 answer 200; 51 answer 410, every one with
`noindex`; none redirect.

The banned-claim scan covers visible text, meta tags, JSON-LD, the raw HTML including embedded
component data, and the sitemap. It looked for:

- Acronis, Zimbra
- Gold Partner, authorized reseller, certified reseller, hosting partner
- best, number one, uptime, 24/7, zero downtime, zero data loss, 100%, unlimited, free, savings,
  cost, guarantee
- nationwide, across Cambodia, 2017
- telecom operator or partner, VPS, web hosting, hosted by
- cPanel, Proxmox, ESET, gateway, SIM card, GSM, IP PBX, "we supply"

The only remaining matches are harmless:

- "live chat" (a 3CX feature)
- "Illustration · not live data"
- "once the system is live"
- "Best way to reach you" (a form label)
- CSS `width:100%`

On the API-backed build, none of the stale database strings appear in any public page or the
sitemap: Gold Partner, Certified/Authorized Reseller, Hosting Partner, Nationwide, across
Cambodia, Yeastar, cPanel, ESET, Proxmox, the hidden service names and 2017.

## Commands and results

```bash
cd backend && .venv/bin/python -m pytest -q                       # 25 passed
cd frontend && npx tsc --noEmit -p .                              # clean
cd frontend && SITE_ENV=production npm run build                  # file-backed: 6 public routes
cd frontend && KHCOLO_API_URL=http://127.0.0.1:8001 INTERNAL_API_KEY=<local> SITE_ENV=production npm run build
```

- Route check: `routecheck.py` for every URL, on both builds.
- Browser checks (Playwright, 21/21) on the 6 public pages:
  - no console errors, overflow or clipped text at 360, 390, 768, 1024 and 1440 px
  - nav shows only public pages
  - mobile drawer focus and Escape
  - reduced motion
  - no-JS reveal

  No form was submitted.
- Screenshots: desktop and mobile for each public page, a 410 URL and the 404.

## Live database: targeted reconciliation (applied 4 Nov 2026, 08:18 UTC)

**Applied.** Render's free web service has no shell, so `app.seed` (run on every API start) calls
`reconcile.run()` when `KH_RECONCILE` is set. It was set to `apply` for one deploy of `aa9e4af`,
then set back to `off`. The log reads "66 field(s) differ from the approved copy" and "Applied 66
change(s)". Inquiries were not touched. The database blocks external connections, so there was no
separate dump. Instead, every old value was printed to the service log on a `RECONCILE-BACKUP`
line first. Those 66 old values are identical to `content/*.json` at commit `2f05123`, so git
history is the backup.

The plan as written before it ran:

The live PostgreSQL rows still hold the pre-review copy: partner tiers, "Cambodia, nationwide",
all services, categories and products published, and 308 redirects for Acronis, Zimbra and T46U.
The editorial lock keeps them off the public pages. Reconcile before turning the lock off:

1. **Back up first.** The free Render database has no automatic backups. Take a `pg_dump` from a
   trusted machine after adding its IP to the database allowlist temporarily, then remove it.
2. **Dry run** on Render:

   ```bash
   cd backend && python -m app.reconcile
   ```

   Compare the printed differences with this document. On the local copy it listed 66 fields:
   - company settings (9)
   - pages (8)
   - the two public services
   - 6 services, 3 categories and 30 products to unpublish
   - 3 redirects to 410
3. **Apply** with `python -m app.reconcile --apply`. Only those rows change; inquiries and other rows
   are untouched.
4. Run `POST /api/v1/admin/revalidate` with the admin token. Confirm the API returns only the two
   services and the approved company copy. Then set `"editorialLock": false` in a later reviewed
   change, rebuild, and re-run the route check against the API-backed build.
5. **Caches.** Render serves the site directly, with no CDN configured; a new deploy replaces the
   Next.js page cache. Search engines and link previews keep old copies until they recrawl.
   Request removal or recrawl in Google Search Console, and re-scrape the share image in Facebook's
   Sharing Debugger and Telegram.

Do not use `SEED_OVERWRITE=1` or `app.seed --overwrite` for this. They reset every content row.

## Original khcolo.com (WordPress): not changed by this review

All 52 sitemap URLs were scanned. The owner or WordPress editor must edit or remove these and
decide how old URLs are handled. This review cannot change that site.

| Page | Claims to remove or substantiate |
| --- | --- |
| `/` | Acronis; hosting/VPS (SPanel); hardware ("we stock that as well", IP phones, VoIP gateways, IP PBX); Gold 3CX Partner, "Certified & authorized … authorized reseller for every product above"; "PP · SR On-site install across Cambodia"; 24/7; "never lose files"; award-winning |
| `/about-us/` | "IT and telecom partner — hosted voice"; Acronis; cPanel hosting partner; partner tiers; "Since 2017" |
| `/cloud-call-center/` | Gold 3CX Partner; 24/7; "80% lower phone bills", "Save up to 80%", "cut call costs"; "$0" video; "Hosted by KHCOLO"; "we port your SIP trunk and numbers with zero downtime"; "Live now", "SYSTEM UP", agent counts |
| `/3cx-bitrix24-integration/` | "Better than 99% of other solutions", "100% flat fee", "Free forever", "$0 per-user", "12M+ organizations"; demo agent and REC panels |
| `/cloud-services/`, `/professional-business-email/` | Hosting/VPS offer; "99.9% uptime guarantee"; 24/7/365; free migration; "SERVER STATUS Online" panel |
| `/eset-antivirus/` | "Cambodia's ESET Authorised Reseller"; "100% Threats Blocked"; "11 yrs", "30+ yrs"; Acronis pairing; Password Manager in plans |
| `/acronis-cyber-protect-cloud/`, `/zimbra/` | Products no longer sold |
| `/web-security/`, `/geotrust-ssl-certificates/`, `/comodo-ssl-certificates/` | SSL resale, warranty amounts, "free", "unlimited"; placeholder text on the GeoTrust page |
| `/proxmoxve/` | "0ms downtime", "zero downtime"; free consultation |
| `/voice-communication/` | Gold 3CX Partner, Yealink authorised reseller, "Certified for Teams & Zoom Rooms"; "best"; on-site install claims |
| `/video-conference/` | **Template placeholder text and three made-up testimonials** credited to "Stratus" (Samantha Jane, Jake Warren, Kim Smith). Remove immediately. |
| `/it-maintenance/` | "No Limited Remote Support"; "save time and money" |
| `/product-category/*`, 31 × `/product/*`, `/home-product/` | Telecom hardware sale listings |

## Legal questions for the owner and Cambodian counsel

| Topic | Primary text / status | Question |
| --- | --- | --- |
| Telecom | Law on Telecommunications (2015), Arts. 14–17, 37, 89–92: TRC permits to import, supply, sell or repair equipment (Arts. 14–15); certificates and type approval (Art. 16); licences for services and network infrastructure (Art. 17) | Which exact activities need a TRC/MPTC permit, certificate, type approval or licence? This covers 3CX deployment, 3CX licence resale, hosted PBX, trunk arrangement, IP phones and gateways, and infrastructure. Get a written interpretation before promotion. Using a licensed partner does not automatically cover KHCOLO's own marketing. |
| Electronic commerce | Law on Electronic Commerce (2019), Arts. 26–29, 32 | Does the inquiry/quotation and Telegram/email sales model need an e-commerce permit, licence or certificate? Which entity, address, payment, termination, refund and warranty terms must be shown before a sale? |
| Advertising and consumer rights | Law on Consumer Protection (2019), Sub-Decree 232 on advertising | What Khmer-language presentation, claim substantiation and advertising approval apply to these pages and to social channels? What warranty and dispute process applies? |
| Personal information | E-Commerce Law Art. 32; draft Personal Data Protection Law (not enacted as of 2026) | Confirm providers, notification channels, backups, IP/log retention, access roles and the response process for correction or deletion requests. |
| Draft code of conduct | `20261102_Presentaton_CoC_Validation_WS_V2.pdf` (draft, 2–3 Nov 2026) | Monitor for a signed version and an effective date. Use its themes as a checklist: identity, accurate information, data security, advertising including AI disclosure, IP and disputes. Do not present them as enacted. |

## Owner records needed

- Legal name, registration extract and date, registered address, tax/business activities.
- Vendor letters for any partner tier (3CX, Bitrix24 and others) before any badge returns.
- TRC/MPTC documentation, if any, and the contracts with providers used for calls and numbers.
- Actual hosting and notification settings in production: Render region, Telegram/SMTP enabled or
  not, who can read inquiries, retention.
- Whether Phnom Penh and Siem Reap are both staffed, and any office address. Service areas are not
  offices. Earlier on 4 Nov the owner asked for "Cambodia" instead of the two cities; this recheck
  restores "Phnom Penh and Siem Reap, by agreement". Please confirm which wording you want.
- The exact product name behind "3CRM" (assumed Bitrix24 CRM; not renamed).

## Follow-up the same day: hosting wording and layout

- **Hosting.** On the owner's instruction (no hosting licence), the 3CX options now read "A cloud
  account you own" and "On-premise", with the note "KHCOLO does not host 3CX or provide server
  hosting." A scan of the six public pages (visible text, metadata, JSON-LD) finds "host" only in
  that sentence and in the privacy notice, which says the website itself runs with a third-party
  hosting provider. The URL `/cloud-call-center/` is kept from the original site for search
  continuity; its title and H1 say "3CX phone system configuration".
- **Layout.** Checked at 390, 768, 1024, 1280, 1440 and 1920 px. Fixes:
  - **Hero:** the example panel ends on the content edge, so "Illustration · not live data" is
    never cut off (it was clipped at 1024 and 1440 px). Below 1280 px the illustration sits under
    the text, lined up with it. The per-card "Example" chips are replaced by the panel label.
  - **Home sections:**
    - The platforms strip is on the 12-column grid.
    - The quote section's grid lines meet its frame.
    - The contact-band tiles stay clear of the screen edge and, on phones, sit above and below the
      box instead of behind it.
  - **Footer:** Services, Company and Socials in three columns, right-aligned.
  - **Service pages:**
    - "What's included" fills every row (5 cards = 3 + 2).
    - A single related service gets a full-width card.
    - The open FAQ icon stays square.
  - **About:** the single service group is a full-width card.
  - **Contact:** the "Send request" arrow sits at the button's end on phones.
  - **Wording:** "Pricing and availability" is now "Pricing and scope", because no stock is sold.
- **Results:** 21/21 browser checks, no horizontal overflow at any width, and the route check is
  unchanged (6 × 200, 51 × 410 + noindex, sitemap 6 URLs). Lighthouse (home and 3CX, mobile)
  scores 100 for accessibility, best practices and SEO, with CLS 0.

## Completion gate

| Check | Result |
| --- | --- |
| Homepage, About, Contact, Privacy, the two service routes | Pass on both local builds (desktop and mobile) |
| All previous-redesign and original-site URLs | 51 × 410 + noindex; no prohibited route is served |
| Acronis / Zimbra / hosting / telecom-hardware claims in public HTML, metadata, schema, sitemap | None found |
| Unverifiable founding year or partner tier visible | None found |
| Live redesign (khcolo-web.onrender.com) | **Published** 4 Nov 2026, `aa9e4af` |
| Live database | **Reconciled**: 66 fields, inquiries untouched; old values = `2f05123` content |
| Original khcolo.com (WordPress) | **Not changed.** Owner or editor action required |
| Staging deploy | Skipped: the owner chose to publish directly. The production build was the one checked locally; this session cannot reach onrender.com, so check the live pages in a browser |
