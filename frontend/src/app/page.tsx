import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, HardHat, Languages, MapPin } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { CallFlow } from "@/components/home/CallFlow";
import { HeroScene } from "@/components/home/HeroScene";
import { PlatformBand } from "@/components/home/PlatformBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { ContactBand } from "@/components/ui/ContactBand";
import { ProcessSteps } from "@/components/ui/ProcessSteps";
import { Eyebrow, SectionHeader } from "@/components/ui/Section";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { getCompany, getPage, getServices } from "@/lib/content";
import { CORE_KEYWORDS, organizationLd, pageMetadata, websiteLd } from "@/lib/seo";
import { routes } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("/");
  return pageMetadata({ title: page.title, description: page.description, path: "/", keywords: CORE_KEYWORDS });
}

// Public scope during the legal review: 3CX configuration and Bitrix24 CRM workflows only.
// Calls, numbers and connectivity are always described as supplied by the customer's provider.
const HOW_WE_WORK = [
  { title: "Understand", body: "Tell us how calls, chats and sales work in your business today." },
  { title: "Recommend", body: "We recommend the right 3CX and Bitrix24 setup and go through features and pricing with you." },
  { title: "Configure", body: "We deploy and configure 3CX and Bitrix24 and connect them to each other." },
  { title: "Support", body: "Local support in Khmer or English from the same team that set it up." },
];

/** The coloured feature list. Every colour keeps at least 3:1 contrast on white at this size. */
const WORDS: { slug: string; label: string; color: string }[] = [
  { slug: "cloud-call-center", label: "3CX call queues", color: "var(--color-brand-600)" },
  { slug: "cloud-call-center", label: "website live chat", color: "#0284c7" },
  { slug: "cloud-call-center", label: "WhatsApp", color: "var(--color-accent-600)" },
  { slug: "cloud-call-center", label: "video meetings", color: "#6366f1" },
  { slug: "3cx-bitrix24-integration", label: "Bitrix24 CRM", color: "#0d9488" },
  { slug: "3cx-bitrix24-integration", label: "sales pipelines", color: "var(--color-accent-700)" },
  { slug: "3cx-bitrix24-integration", label: "tasks and projects", color: "#0369a1" },
  { slug: "3cx-bitrix24-integration", label: "contact-center workflows", color: "var(--color-brand-700)" },
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

const cell = "relative border-r border-b border-line p-8 sm:p-12 lg:p-14";

export default async function HomePage() {
  const [company, services] = await Promise.all([getCompany(), getServices()]);
  const bySlug = (slug: string) => services.find((s) => s.slug === slug);
  const threecx = bySlug("cloud-call-center");
  const bitrix = bySlug("3cx-bitrix24-integration");
  const areas = company.serviceAreas.map((a) => a.name).join(" · ");

  const expectations = [
    ...company.principles.map((p, i) => ({ ...p, icon: ["engineer", "wrench", "layers"][i] ?? "server" })),
    { title: "Khmer or English", body: "Talk to engineers directly in the language your team prefers, from planning through support.", icon: "languages" },
    { title: "Projects by agreement", body: `Projects in ${company.serviceAreas.map((a) => a.name).join(" and ")}, agreed with you case by case.`, icon: "map" },
    { title: "Your provider, your lines", body: "Calls, phone numbers and connectivity are supplied separately by your own authorized provider.", icon: "phone" },
  ];

  return (
    <>
      <JsonLd data={[organizationLd(company), websiteLd()]} />

      {/* Hero ------------------------------------------------------------ */}
      <section className="@container relative overflow-hidden border-b border-line bg-white">
        <div className="container-site relative grid xl:min-h-[640px] xl:grid-cols-12">
          <div className="relative z-10 pt-14 pb-16 sm:pt-20 lg:pt-28 lg:pb-24 xl:col-span-7">
            <h1 className="text-display max-w-[11.5em] text-ink-950">
              3CX phone system configuration and Bitrix24 CRM workflows
              <span
                aria-hidden
                className="caret ml-[0.12em] inline-block h-[0.78em] w-[0.36em] translate-y-[0.08em] bg-gradient-to-b from-brand-500 to-brand-200"
              />
            </h1>
            <p className="text-lede mt-8 max-w-[33rem] text-muted">
              We deploy, configure and support 3CX and Bitrix24 CRM for Cambodian businesses, in Khmer or English. Calls,
              phone numbers and connectivity are supplied separately by your authorized provider.
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
              <span>3CX configuration</span>
              <span>Bitrix24 CRM</span>
              <span>{areas} · by agreement</span>
            </p>
          </div>
        </div>
        {/* Decorative example: below the text up to 1279px, beside it from the 7/12 column line on wide screens. Its panel ends on the content edge. */}
        <HeroScene className="relative hidden h-[520px] border-t border-line md:block xl:absolute xl:inset-y-0 xl:right-0 xl:left-[calc(50%+100px)] xl:h-auto xl:border-t-0" />
      </section>

      {/* Platforms ------------------------------------------------------- */}
      <section aria-labelledby="platforms-strip-title" className="border-b border-line py-16 lg:py-20">
        <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4" data-reveal>
            <h2 id="platforms-strip-title" className="text-eyebrow text-muted">
              Platforms we configure
            </h2>
            <p className="mt-4 max-w-xs text-[0.95rem] leading-relaxed text-muted">
              3CX and Bitrix24 are products of their own vendors. We set them up and support them for your business.
            </p>
          </div>
          <ul className="grid grid-cols-1 border-t border-l border-line sm:grid-cols-2 lg:col-span-8">
            {company.partners.map((p, i) => (
              <li key={p.vendor} data-reveal style={{ ["--i" as string]: i + 1 }} className="border-r border-b border-line p-6 sm:p-8">
                <span className="block text-[1.5rem] leading-none tracking-[-0.03em] text-ink-950">{p.vendor}</span>
                <span className="mt-3 block font-mono text-[0.68rem] tracking-[0.05em] text-muted uppercase">{p.relationship}</span>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">{p.scope}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How we work ------------------------------------------------------ */}
      <section aria-labelledby="approach-title" className="py-24 lg:py-32">
        <div className="container-site">
          <SectionHeader id="approach-title" title="Understand, configure, support.">
            The engineers who design your setup are the same people who answer when something needs attention.
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
              Calls and customers, with{" "}
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 bg-clip-text text-transparent">
                one local team
              </span>
            </h2>
          </div>

          <div className="mt-16 grid border-t border-l border-line md:grid-cols-2">
            {/* Coloured feature list */}
            <div className={`${cell} overflow-hidden`} data-reveal>
              <p className="text-[clamp(1.6rem,1.15rem+1.5vw,2.3rem)] leading-[1.18] tracking-[-0.028em] text-ink-950">
                Local support for{" "}
                {WORDS.map((w, i) => (
                  <span key={w.label}>
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
                <Eyebrow>Phone system and CRM</Eyebrow>
                <h3 className="text-title mt-5 text-ink-950">3CX and Bitrix24, connected.</h3>
                <p className="mt-4 max-w-md leading-relaxed text-muted">{bitrix.summary}</p>
                <Checks items={bitrix.highlights} />
                <div className="mt-8">
                  <DocLink href={routes.service(bitrix.slug)}>Bitrix24 CRM and 3CX</DocLink>
                </div>
              </div>
            )}

            {/* 3CX contact center */}
            {threecx && (
              <div className={`${cell} grid gap-12 overflow-hidden md:col-span-2 lg:grid-cols-2`}>
                <div data-reveal>
                  <Eyebrow>3CX</Eyebrow>
                  <h3 className="text-title mt-5 max-w-[16ch] text-ink-950">Every channel, answered from one queue.</h3>
                  <p className="mt-4 max-w-md leading-relaxed text-muted">{threecx.summary}</p>
                  <Checks items={threecx.highlights} />
                  <div className="mt-8">
                    <DocLink href={routes.service(threecx.slug)}>3CX phone system configuration</DocLink>
                  </div>
                </div>
                <div className="relative -mx-8 -mb-8 flex items-center bg-gradient-to-br from-white via-paper-2 to-brand-50 p-8 sm:-mx-12 sm:-mb-12 sm:p-12 lg:-my-14 lg:-mr-14 lg:ml-0 lg:p-14">
                  <CallFlow />
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
        <div className="container-site">
          <div aria-hidden className="cell-strip h-[92px] border-x border-b border-line [mask-image:linear-gradient(to_bottom,transparent,black)]" />
          <div className="border-x border-line px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
            <ul className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-3">
              {[
                { icon: <MapPin aria-hidden className="size-4" />, name: areas, note: "Project areas, by agreement" },
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
                <span className="mark-mono">KHCOLO · Local support in Khmer and English</span>
              </figcaption>
            </figure>
          </div>
          <div aria-hidden className="cell-strip h-[92px] border-x border-t border-line [mask-image:linear-gradient(to_top,transparent,black)]" />
        </div>
      </section>

      {/* What to expect --------------------------------------------------- */}
      <section aria-labelledby="expect-title" className="py-24 lg:py-32">
        <div className="container-site">
          <SectionHeader id="expect-title" title="A phone system and CRM partner that’s close to home">
            3CX and Bitrix24, configured and supported by one team that already knows your setup.
          </SectionHeader>
          <ul className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {expectations.map((e, i) => (
              <li key={e.title} data-reveal style={{ ["--i" as string]: i % 3 } as CSSProperties}>
                <span className="flex size-9 items-center justify-center bg-brand-50 text-brand-700">
                  <ServiceIcon name={e.icon} className="size-[18px]" />
                </span>
                <h3 className="mt-5 text-[1.15rem] tracking-[-0.015em] text-ink-950">{e.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{e.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ContactBand company={company} title="Start with a conversation." />
    </>
  );
}
