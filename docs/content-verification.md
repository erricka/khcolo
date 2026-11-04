# Content verification against khcolo.com

Checked on 4 November 2026 for the live design (https://khcolo-web.onrender.com).

## How it was checked

1. Downloaded every page in khcolo.com's sitemap: 18 pages, 31 product pages and 3 product
   categories, 52 URLs in all.
2. Split the new site's content into 850 separate items: every heading, sentence, list item, FAQ,
   product spec and note in `content/`, plus the copy written into the page code.
3. Matched each item to the old page it came from. The matching ignores formatting differences
   such as "340x210x44mm" against "340 × 210 × 44 mm". Any number on a product page had to appear
   on that product's old page.
4. Read every item that didn't match closely against the old page by hand.

## Result

Everything on the new site now restates something khcolo.com says, or is a hedge that makes no
claim, such as "confirmed with your quote". There are two deliberate exceptions:

- **The owner's decisions take priority over the old site.** No telecom wording, no Acronis or
  Zimbra, no "Since 2017" and no city list, even though khcolo.com still shows all of them. See
  `docs/legal-wording-review.md`.
- **Higher-risk claims from the old site were left out on purpose.** These are "80% lower phone
  bills", "24/7 support", "99.9% uptime guarantee", "free migration", "zero-downtime number porting"
  and "250 video participants". They could be misleading under the Consumer Protection Law unless
  the owner confirms them.

## Corrected in this pass

These items said more than khcolo.com does:

| Where | Before | Why | Now |
| --- | --- | --- | --- |
| Home, "How we work" | Step "Train and hand over: your staff learn the system and you receive documentation" | khcolo.com only promises training for video-conference rooms, and documentation only in IT Maintenance plans | Four steps: Survey, Recommend, Install and set up, Support, each worded from the old site |
| Home, "What to expect" | "Written quotes", "Training and handover" | Not offered on khcolo.com | "Hardware too" and "Scales with you", both from the old home page |
| Home and About quote | "We believe trust can only be achieved through communication and experienced support" | Not the old site's wording | "Trust, built through communication and support. Talk to a local engineer directly…", as on khcolo.com |
| 3CX process | "Hand over to your team with training" | Training isn't on the 3CX page | "Stay on for updates and local support once the system is live" |
| Bitrix24 | "Local implementation and training"; "Train each team on its own workflow" | The old page says "implemented and supported" | "Local implementation and support"; "Support your team through the rollout and afterwards" |
| ESET | "Works alongside our hosting and IT maintenance"; "Set protection policies per device group" | The old page pairs ESET with hosting and SSL, and manages it from one console | "hosting and SSL services"; "Manage protection across your devices from one ESET PROTECT console" |
| Proxmox VE | "migration", "migrate your workloads", "documentation your own team can follow", a Migration card | The old page offers design, deployment, clustering and support | Migration and documentation removed; the card is now Proxmox Backup Server, which the old page offers |
| Service, category and product pages | "…in a written quote" | Not on khcolo.com | "go through the options, licensing and pricing with you" |
| Contact page | "an engineer will reply", "An engineer gets in touch" | The old page says "our team is ready to answer" | "our team will reply", "We get in touch" |
| Yealink SIP-T30 | "for reception desks, shared areas and light users" | The old page says "Entry-level phone, 1 SIP account" | "An entry-level phone with one SIP account" |
| UC2000-VG | "for contact centers and large sites" | Not on the old page | Removed |
| NeoGate TA400 / TA800 / TA2400 | "compact … for small offices", "desktop … for mid-sized offices", "rack-mount … larger analog estates" | Sizes and uses aren't on the old pages | Summaries list only SIP/IAX2, calling rules, T.38 fax and web management |

## Checked and supported

Every remaining item is backed by khcolo.com, usually in different words:

- **3CX:** one platform for calls, video, WhatsApp, website chat and SMS; queues, wallboards,
  reports, presence; desktop and mobile apps; scheduling, whiteboards, polls, streaming; your own
  SIP trunk; Yealink, Cisco and Fanvil phones; annual licence by simultaneous calls; managed cloud,
  your own cloud (AWS, Tencent, Alibaba) or on-premise.
- **Bitrix24:** CRM, tasks, collaboration, contact center, HR and automation, the integrations
  list, and connection to 3CX.
- **Video conferencing:** the Yealink line-up by room size; Teams Rooms, Zoom Rooms and Google
  Meet; site survey, cabling, mounting, calibration, team training, warranty and support.
- **ESET:** home plans, PROTECT Entry, Advanced and Complete, platforms, and local licensing,
  activation and renewal.
- **SSL/TLS:** RapidSSL, GoGetSSL and GeoTrust with the stated warranties and issuance times;
  CSR, validation, installation and renewal.
- **Hosting:** shared hosting and managed VPS, SSD/NVMe, backups, WAF, CDN, SPanel, SShield,
  OpenLiteSpeed, and migration.
- **Proxmox VE:** KVM and LXC, clustering, HA, live migration, SDN, storage types, and backup
  with Proxmox Backup Server.
- **IT Maintenance:** the three published plans (remote and on-site visits, standby technicians,
  preventive maintenance, consulting, monthly report, documentation, IT policy, action plan),
  server, PC and network maintenance, and backup and restore.
- **Products:** all 30 products' specs against their own old pages, including SIP accounts,
  ports, channels, codecs, power, size, range and accessories. Where the old page contradicts
  itself (for example TG400 channels, W56H base compatibility), the new page says "confirmed with
  your quote" instead of picking one.
- **Company:** contact details, partner relationships as published, local engineers, Khmer and
  English, on-site installation across Cambodia, one point of contact.

## New wording with no factual claim

- Hedges such as "confirmed with your quote" and "features vary by plan".
- Short explanations of a problem, such as "Certificates expire, validation emails get missed…".
- The privacy notice and the form's help text, which describe how this website handles
  enquiries. khcolo.com has no equivalent, so the owner should read them once.

## Owner to confirm

- Partner statuses are current (3CX Gold Partner, Yeastar, Yealink, cPanel, ESET).
- Product photos may be used (they come from the old site and the manufacturers).
- The privacy notice matches how enquiries are actually handled.
