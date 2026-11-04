# Website wording review against Cambodian law

Reviewed on 4 November 2026 for the live design (https://khcolo-web.onrender.com). This is a
plain-language risk review of the website's wording by an AI assistant, not legal advice. Before
launch, ask a Cambodian lawyer or the relevant ministry to confirm the points marked **Confirm**.

## Laws considered

- **Law on Telecommunications (2015).** Providing telecom services, including VoIP, needs a licence
  from TRC and MPTC. Importing or distributing telecom equipment needs TRC type approval and import
  permits, which only TRC-recognised Qualified Agents can apply for.
- **Law on Consumer Protection (2019)**, Sub-Decree 232 on advertising and the 2024 Prakas on unfair
  practices. Advertising must not be misleading, including claims about status, quality or
  guarantees. Fines can reach about KHR 80 million (US$20,000).
- **Law on Electronic Commerce (2019).** Applies to selling online. The site has no checkout, so
  this mostly matters as good practice: clear business identity and information in Khmer.
- **Personal data.** Cambodia has no personal data protection law in force; the draft law was still
  under consultation in 2026. The site's privacy notice already covers what the form collects.

## Changes made

| Risk | Wording before | Why it was a concern | Now |
| --- | --- | --- | --- |
| High | "KHCOLO is a Cambodia-based IT and telecom partner" (About page, its title, Google description, company data) | KHCOLO is not registered with TRC or MPTC | "Cambodia-based IT solutions company" |
| High | 3CX "Hosted by KHCOLO" | Reads as KHCOLO running a hosted phone (VoIP) service, which needs a licence | "Managed cloud server": KHCOLO runs the 3CX *software*; lines and numbers come from the customer's licensed operator |
| High | "Option to keep your existing numbers", "Existing-number retention", banner "Ask us about keeping your existing numbers" | Phone numbers belong to licensed operators; KHCOLO cannot retain or port numbers itself | "Works with lines and numbers from your licensed telecom operator"; banner "We plan the switch with your telecom operator"; FAQ explains numbers stay with the operator |
| High | "connect your SIP trunk", "We help you pick a SIP trunk" | Could suggest KHCOLO supplies phone lines | "connect the SIP trunk from your telecom operator" |
| Medium | VoIP gateway category with SIM cards (GSM, LTE, WCDMA) | SIM gateways can be associated with unlicensed call termination, which TRC acts against | Intro now says gateways are for your own business lines and SIM cards from licensed operators |
| Medium | "Answer every customer and keep every conversation on record" | Absolute promise, and implies recording every call | "Reach customers on the channels they use and keep conversations in one place" |
| Low | "so every endpoint is covered" (ESET) | Absolute security claim | "so your endpoints are protected and managed from one place" |
| Low | "VoIP" in the company's search data | Telecom-service term | "IP phone systems" |
| Added | Footer | — | "Phone lines and numbers are provided by licensed telecom operators." on every page |

Removed earlier the same day at the owner's request: Acronis and Zimbra (no longer sold), the
operating year 2017 (until checked against the registration licence), and the city list (now
"Cambodia").

## Kept, but please confirm

| Item | Why | What to check |
| --- | --- | --- |
| Partner statuses: 3CX Gold Partner, Yeastar Certified Reseller, Yealink Authorized Reseller, cPanel Hosting Partner, ESET Reseller | If a status has lapsed, the claim is misleading under the Consumer Protection Law | Current certificate or partner portal for each. I'll remove any that aren't current. |
| Selling IP phones, VoIP gateways and IP PBX appliances | Telecom equipment needs TRC type approval, and importing it needs a TRC import permit | That the models are type-approved, and that stock is bought from a TRC Qualified Agent (or that KHCOLO is one) |
| Hosting the 3CX software for customers | Running the software on a server is IT hosting; providing the phone service itself would need a licence | That customers always use their own licensed operator's lines and numbers |
| "On-site installation across Cambodia" | Must be true in practice | That the team does install outside Phnom Penh and Siem Reap |
| Product photos | Copied from the old site, originally from manufacturers | Rights to use them (already in the content review list) |

## Recommended before launch

- **Khmer version of the site.** Cambodian rules expect consumer-facing information and advertising in
  Khmer. The site is English with Khmer greetings. A Khmer version of the main pages is the
  safest path.
- **Business identity in the footer.** Add the registered company name and registration number
  once confirmed from the licence.
- **Ask a local lawyer** to read the 3CX page and the gateways category, since those are the closest
  to telecom regulation.
