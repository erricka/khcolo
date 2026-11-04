import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, HardHat, Languages, MapPin, Wrench } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { CallFlow } from "@/components/home/CallFlow";
import { HeroScene } from "@/components/home/HeroScene";
import { PlatformBand } from "@/components/home/PlatformBand";
import { CategoryCard } from "@/components/products/CategoryCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { ContactBand } from "@/components/ui/ContactBand";
import { PixelBlock } from "@/components/ui/Pixels";
import { ProcessSteps } from "@/components/ui/ProcessSteps";
import { Eyebrow, SectionHeader } from "@/components/ui/Section";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { getCategories, getCompany, getPage, getProducts, getServices } from "@/lib/content";
import { CORE_KEYWORDS, organizationLd, pageMetadata, websiteLd } from "@/lib/seo";
import { brandLabel, CATEGORY_HERO_PRODUCT, routes } from "@/lib/site";
import type { Service } from "@/lib/types";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("/");
  return pageMetadata({ title: page.title, description: page.description, path: "/", keywords: CORE_KEYWORDS });
}

const HOW_WE_WORK = [
  { title: "Survey", body: "Tell us what you run today. For meeting rooms, we measure the room, lighting and network first." },
  { title: "Recommend", body: "We recommend the right solution for your business and go through features and pricing with you." },
  { title: "Install and set up", body: "Local engineers handle the setup, including cabling, mounting and on-site installation." },
  { title: "Support", body: "Licensing, renewals and local support from the same team that designed your setup." },
];

/** The coloured service list. Every colour keeps at least 3:1 contrast on white at this size. */
const WORDS: { slug: string; label: string; color: string }[] = [
  { slug: "cloud-call-center", label: "3CX phone systems", color: "var(--color-brand-600)" },
  { slug: "3cx-bitrix24-integration", label: "Bitrix24 CRM", color: "var(--color-accent-600)" },
  { slug: "voice-communication", label: "video conferencing", color: "#0284c7" },
  { slug: "eset-antivirus", label: "ESET antivirus", color: "#6366f1" },
  { slug: "web-security", label: "SSL certificates", color: "#0d9488" },
  { slug: "cloud-services", label: "cloud VPS hosting", color: "var(--color-accent-700)" },
  { slug: "proxmoxve", label: "Proxmox servers", color: "#0369a1" },
  { slug: "it-maintenance", label: "IT maintenance", color: "var(--color-brand-700)" },
];

function DocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1.5 text-[0.95rem] text-brand-700 hover:text-brand-900">
      {children}
      <ArrowRight aria-hidden className="arrow-nudge size-4" />
    </Link>
  );
}

function Checks({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-2.5">
      {items.map((h) => (
        <li key={h} className="flex gap-2.5 text-[0.95rem] text-ink-900">
          <Check aria-hidden className="mt-1 size-3.5 shrink-0 text-accent-600" strokeWidth={2.5} />
          {h}
        </li>
      ))}
    </ul>
  );
}

function ServiceLinks({ items }: { items: Service[] }) {
  return (
    <ul className="mt-8 divide-y divide-line border-y border-line">
      {items.map((s) => (
        <li key={s.slug}>
          <Link href={routes.service(s.slug)} className="group flex items-center gap-3 py-3.5 text-ink-900 hover:text-brand-700">
            <span className="flex size-8 items-center justify-center bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
              <ServiceIcon name={s.icon} className="size-4" />
            </span>
            <span className="flex-1">{s.shortName}</span>
            <ArrowRight aria-hidden className="arrow-nudge size-4 text-ink-400 group-hover:text-brand-700" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

const cell = "relative border-r border-b border-line p-8 sm:p-12 lg:p-14";

export default async function HomePage() {
  const [company, services, categories, products] = await Promise.all([
    getCompany(),
    getServices(),
    getCategories(),
    getProducts(),
  ]);
  const bySlug = (slug: string) => services.find((s) => s.slug === slug);
  const threecx = bySlug("cloud-call-center");
  const bitrix = bySlug("3cx-bitrix24-integration");
  const maint = bySlug("it-maintenance");
  const inGroup = (key: string) => services.filter((s) => s.group === key);
  const group = (key: string) => company.solutionGroups.find((g) => g.key === key);
  const security = group("security");
  const cloud = group("cloud");
  const managed = group("managed-it");

  const expectations = [
    ...company.principles.map((p, i) => ({ ...p, icon: ["engineer", "wrench", "layers", "radar"][i] ?? "server" })),
    { title: "Khmer or English", body: "Talk to engineers directly in the language your team prefers, from planning through support.", icon: "languages" },
    { title: "On site across Cambodia", body: "Service and on-site installation for businesses across Cambodia.", icon: "map" },
    { title: "Hardware too", body: "VoIP gateways, IP phones and IP PBX appliances from the brands we install every day.", icon: "server" },
    { title: "Scales with you", body: "As your business grows, so do your technology needs. KHCOLO is the IT partner that scales with you.", icon: "cloud" },
  ];

  return (
    <>
      <JsonLd data={[organizationLd(company), websiteLd()]} />

      {/* Hero ------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div className="container-site relative grid lg:min-h-[640px] lg:grid-cols-12">
          <div className="relative z-10 pt-14 pb-16 sm:pt-20 lg:col-span-7 lg:pt-28 lg:pb-24">
            <h1 className="text-display max-w-[11.5em] text-ink-950">
              3CX, Bitrix24 and local IT support for Cambodian businesses
              <span
                aria-hidden
                className="caret ml-[0.12em] inline-block h-[0.78em] w-[0.36em] translate-y-[0.08em] bg-gradient-to-b from-brand-500 to-brand-200"
              />
            </h1>
            <p className="text-lede mt-8 max-w-[33rem] text-muted">
              3CX phone systems, Bitrix24 CRM, cybersecurity, hosting and IT maintenance, planned, installed and
              supported by one local team, in Khmer or English.
            </p>
            <div className="enter mt-10 flex flex-wrap gap-3" style={{ ["--d" as string]: 1 }}>
              <ButtonLink
                href={company.telegram.url}
                size="lg"
                icon="arrow"
                data-track="contact_click"
                data-track-method="telegram"
                data-track-location="hero"
              >
                Talk to our team
              </ButtonLink>
              <ButtonLink href={routes.consult("cloud-call-center")} variant="secondary" size="lg" icon={null}>
                Request a consultation
              </ButtonLink>
            </div>
            <p
              className="enter mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.72rem] tracking-[0.06em] text-muted uppercase"
              style={{ ["--d" as string]: 2 }}
            >
              <span className="inline-flex items-center gap-2 text-accent-700">
                <span className="status-dot size-1.5 rounded-full bg-accent-500" />
                3CX Gold Partner
              </span>
              <span>Local engineers</span>
              <span>Across Cambodia</span>
            </p>
          </div>
        </div>
        {/* Decorative scene: below the text on tablets, bleeding off the right edge on desktop. */}
        <HeroScene className="relative hidden h-[520px] border-t border-line md:block lg:absolute lg:inset-y-0 lg:right-0 lg:left-[58%] lg:h-auto lg:border-t-0 xl:left-[57%]" />
      </section>

      {/* Partners --------------------------------------------------------- */}
      <section aria-labelledby="partners-strip-title" className="border-b border-line py-16 lg:py-20">
        <div className="container-site">
          <h2 id="partners-strip-title" className="text-eyebrow text-center text-muted">
            Partners &amp; platforms we deploy
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-7">
            {company.partners.map((p, i) => (
              <li key={p.vendor} data-reveal style={{ ["--i" as string]: i }} className="border-b border-line pb-4 text-center">
                <span className="block text-[1.3rem] tracking-[-0.03em] text-ink-950">{p.vendor}</span>
                <span className="mt-1 block font-mono text-[0.66rem] tracking-[0.05em] text-muted uppercase">{p.relationship}</span>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-center">
            <DocLink href={`${routes.about}#partners`}>About our partnerships</DocLink>
          </p>
        </div>
      </section>

      {/* How we work ------------------------------------------------------ */}
      <section aria-labelledby="approach-title" className="py-24 lg:py-32">
        <div className="container-site">
          <SectionHeader id="approach-title" title="Survey, install, support. Done.">
            The engineers who design your environment are the same people who answer when something needs attention.
          </SectionHeader>
          <div className="mt-16 lg:mt-20">
            <ProcessSteps steps={HOW_WE_WORK} />
          </div>
        </div>
      </section>

      <PlatformBand />

      {/* Solutions bento -------------------------------------------------- */}
      <section id="solutions" aria-labelledby="solutions-title" className="scroll-mt-24 py-24 lg:py-32">
        <div className="container-site">
          <div className="max-w-4xl" data-reveal="blur">
            <h2 id="solutions-title" className="text-headline text-ink-950">
              Calls, customers and IT, with{" "}
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 bg-clip-text text-transparent">
                one local team
              </span>
            </h2>
          </div>

          <div className="mt-16 grid border-t border-l border-line md:grid-cols-2">
            {/* Coloured service list */}
            <div className={`${cell} overflow-hidden`} data-reveal>
              <p className="text-[clamp(1.6rem,1.15rem+1.5vw,2.3rem)] leading-[1.18] tracking-[-0.028em] text-ink-950">
                Local support for{" "}
                {WORDS.map((w, i) => (
                  <span key={w.slug}>
                    <Link
                      href={routes.service(w.slug)}
                      style={{ color: w.color }}
                      className="decoration-[0.06em] underline-offset-[0.12em] hover:underline"
                    >
                      {w.label}
                    </Link>
                    {i < WORDS.length - 2 ? ", " : i === WORDS.length - 2 ? " and " : "."}
                  </span>
                ))}
              </p>
            </div>

            {/* 3CX + Bitrix24 */}
            {bitrix && (
              <div className={cell} data-reveal style={{ ["--i" as string]: 1 }}>
                <Eyebrow>Core platforms</Eyebrow>
                <h3 className="text-title mt-5 text-ink-950">3CX and Bitrix24, connected.</h3>
                <p className="mt-4 max-w-md leading-relaxed text-muted">{bitrix.summary}</p>
                <Checks items={bitrix.highlights} />
                <div className="mt-8">
                  <DocLink href={routes.service(bitrix.slug)}>3CX + Bitrix24 integration</DocLink>
                </div>
              </div>
            )}

            {/* Cloud call center */}
            {threecx && (
              <div className={`${cell} grid gap-12 overflow-hidden md:col-span-2 lg:grid-cols-2`}>
                <div data-reveal>
                  <Eyebrow>3CX Gold Partner</Eyebrow>
                  <h3 className="text-title mt-5 max-w-[16ch] text-ink-950">Cloud call centers that answer every channel.</h3>
                  <p className="mt-4 max-w-md leading-relaxed text-muted">{threecx.summary}</p>
                  <Checks items={threecx.highlights} />
                  <div className="mt-8">
                    <DocLink href={routes.service(threecx.slug)}>3CX Cloud Call Center</DocLink>
                  </div>
                </div>
                <div className="relative -mx-8 -mb-8 flex items-center bg-gradient-to-br from-white via-paper-2 to-brand-50 p-8 sm:-mx-12 sm:-mb-12 sm:p-12 lg:-my-14 lg:-mr-14 lg:ml-0 lg:p-14">
                  <CallFlow />
                </div>
              </div>
            )}

            {/* Security and cloud */}
            {security && (
              <div className={cell} data-reveal>
                <Eyebrow>Protect</Eyebrow>
                <h3 className="text-title mt-5 text-ink-950">{security.name}</h3>
                <p className="mt-4 max-w-md leading-relaxed text-muted">{security.need}</p>
                <ServiceLinks items={inGroup("security")} />
              </div>
            )}
            {cloud && (
              <div className={cell} data-reveal style={{ ["--i" as string]: 1 }}>
                <Eyebrow>Run</Eyebrow>
                <h3 className="text-title mt-5 text-ink-950">{cloud.name}</h3>
                <p className="mt-4 max-w-md leading-relaxed text-muted">{cloud.need}</p>
                <ServiceLinks items={inGroup("cloud")} />
              </div>
            )}

            {/* Managed IT */}
            {managed && maint && (
              <div className={`${cell} grid gap-10 overflow-hidden md:col-span-2 lg:grid-cols-2`}>
                <div data-reveal>
                  <Eyebrow>Maintain</Eyebrow>
                  <h3 className="text-title mt-5 max-w-[18ch] text-ink-950">{managed.need}</h3>
                  <p className="mt-4 max-w-md leading-relaxed text-muted">{maint.summary}</p>
                  <div className="mt-8">
                    <DocLink href={routes.service(maint.slug)}>IT Maintenance</DocLink>
                  </div>
                </div>
                <div
                  className="relative self-center border border-line bg-white p-6 font-mono text-[0.8rem] text-ink-700"
                  data-reveal
                  style={{ ["--i" as string]: 1 }}
                >
                  <p className="text-[0.68rem] tracking-[0.08em] text-ink-500 uppercase">Preventive maintenance</p>
                  <ul className="mt-4 space-y-2.5">
                    {maint.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5">
                        <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-accent-600" strokeWidth={2.5} />
                        {h}
                      </li>
                    ))}
                  </ul>
                  <PixelBlock pattern="c" className="absolute -top-px -right-px h-[23px] w-[46px]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quote ------------------------------------------------------------ */}
      <section aria-labelledby="quote-title" className="relative border-y border-line">
        <h2 id="quote-title" className="sr-only">
          How we work with customers
        </h2>
        <div aria-hidden className="bg-cells h-[92px] border-b border-line bg-[position:center_top] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
        <div className="container-site">
          <div className="border-x border-line px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
              {[
                { icon: <MapPin aria-hidden className="size-4" />, name: "Cambodia", note: "Service area" },
                { icon: <Wrench aria-hidden className="size-4" />, name: "On-site installation", note: "Across the country" },
                { icon: <Languages aria-hidden className="size-4" />, name: "Khmer · English", note: "Support languages" },
                { icon: <HardHat aria-hidden className="size-4" />, name: "Local engineers", note: "Based in Cambodia" },
              ].map((t, i) => (
                <li
                  key={t.name}
                  className={`border-b pb-4 ${i === 0 ? "border-ink-950" : "border-line"}`}
                  data-reveal
                  style={{ ["--i" as string]: i }}
                >
                  <span className={`flex items-center gap-2 ${i === 0 ? "text-ink-950" : "text-muted"}`}>
                    <span className="text-brand-600">{t.icon}</span>
                    {t.name}
                  </span>
                  <span className="mt-1 block font-mono text-[0.66rem] tracking-[0.05em] text-muted uppercase">{t.note}</span>
                </li>
              ))}
            </ul>
            <figure className="mt-14" data-reveal="blur">
              <blockquote>
                <p className="max-w-4xl text-[clamp(1.4rem,1.1rem+1.1vw,2rem)] leading-[1.3] tracking-[-0.02em] text-ink-950">
                  &ldquo;Trust, built through communication and support. Talk to a local engineer directly, in Khmer or
                  English, with no overseas ticket queue.&rdquo;
                </p>
              </blockquote>
              <figcaption className="mt-8 font-mono text-[0.75rem] tracking-[0.06em] uppercase">
                <span className="mark-mono">KHCOLO · Local IT support in Cambodia</span>
              </figcaption>
            </figure>
          </div>
        </div>
        <div aria-hidden className="bg-cells h-[92px] border-t border-line bg-[position:center_top] [mask-image:linear-gradient(to_top,transparent,black)]" />
      </section>

      {/* What to expect --------------------------------------------------- */}
      <section aria-labelledby="expect-title" className="py-24 lg:py-32">
        <div className="container-site">
          <SectionHeader id="expect-title" title="An IT partner that’s close to home">
            Our services and the hardware behind them, from one team that already knows your setup.
          </SectionHeader>
          <ul className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {expectations.map((e, i) => (
              <li key={e.title} data-reveal style={{ ["--i" as string]: i % 4 } as CSSProperties}>
                <span className="flex size-9 items-center justify-center bg-brand-50 text-brand-700">
                  <ServiceIcon name={e.icon} className="size-[18px]" />
                </span>
                <h3 className="mt-5 text-[1.15rem] tracking-[-0.015em] text-ink-950">
                  {e.title}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{e.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Hardware --------------------------------------------------------- */}
      <section aria-labelledby="hardware-title" className="relative border-t border-line py-24 lg:py-32">
        <div
          aria-hidden
          className="bg-cells absolute top-0 right-0 hidden h-[276px] w-[460px] bg-[position:right_-1px_top_-1px] [mask-image:linear-gradient(to_bottom_left,black_30%,transparent_75%)] lg:block"
        />
        <div className="container-site relative">
          <SectionHeader id="hardware-title" title="Phones, gateways and PBX appliances, supplied and set up">
            The equipment we install every day, provisioned and supported end to end. There&rsquo;s no online checkout:
            send your requirements and we&rsquo;ll confirm price and availability.
          </SectionHeader>
          <div className="mt-14 grid gap-4 md:grid-cols-3 lg:mt-16">
            {categories.map((c, i) => {
              const inCat = products.filter((p) => p.category === c.slug);
              return (
                <CategoryCard
                  key={c.slug}
                  category={c}
                  index={i}
                  hero={inCat.find((p) => p.slug === CATEGORY_HERO_PRODUCT[c.slug]) ?? inCat[0]}
                  sample={inCat.slice(0, 4)}
                  brands={[...new Set(inCat.map(brandLabel))].slice(0, 3)}
                />
              );
            })}
          </div>
          <div className="mt-10 flex flex-wrap gap-3" data-reveal>
            <ButtonLink href={routes.products} icon="arrow">
              Browse all {products.length} products
            </ButtonLink>
            <ButtonLink href={`${routes.contact}?type=quote#inquiry`} variant="secondary" icon={null}>
              Send your requirements
            </ButtonLink>
          </div>
        </div>
      </section>

      <ContactBand company={company} title="Start with a conversation." />
    </>
  );
}
