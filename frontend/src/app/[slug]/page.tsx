import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Info } from "lucide-react";

import { JsonLd } from "@/components/seo/JsonLd";
import { OptionBlockView } from "@/components/services/OptionBlockView";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { ContactBand } from "@/components/ui/ContactBand";
import { PageHero } from "@/components/ui/PageHero";
import { ProcessSteps } from "@/components/ui/ProcessSteps";
import { Eyebrow, SectionHeader } from "@/components/ui/Section";
import { SectionNav } from "@/components/ui/SectionNav";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { getCategories, getCompany, getService, getServices } from "@/lib/content";
import { CORE_KEYWORDS, pageMetadata, serviceLd } from "@/lib/seo";
import { routes } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  const core = slug === "cloud-call-center" || slug === "3cx-bitrix24-integration";
  return pageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: routes.service(slug),
    keywords: core ? CORE_KEYWORDS.slice(0, 6) : undefined,
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [service, company, services, categories] = await Promise.all([
    getService(slug),
    getCompany(),
    getServices(),
    getCategories(),
  ]);
  if (!service) notFound();

  const group = company.solutionGroups.find((g) => g.key === service.group);
  const related = service.related.map((r) => services.find((s) => s.slug === r)).filter((s) => s !== undefined);
  const relatedCategories = service.relatedCategories
    .map((c) => categories.find((cat) => cat.slug === c))
    .filter((c) => c !== undefined);

  const nav = [
    { id: "overview", label: "Overview" },
    { id: "capabilities", label: "Capabilities" },
    ...(service.options.length ? [{ id: "options", label: "Options" }] : []),
    { id: "how-we-work", label: "How we work" },
    ...(service.faqs.length ? [{ id: "faq", label: "FAQ" }] : []),
    { id: "related", label: "Related" },
  ];

  return (
    <>
      <JsonLd data={serviceLd(service, group?.name ?? "")} />

      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: service.shortName, path: routes.service(service.slug) },
        ]}
        eyebrow={
          <Eyebrow>
            <span className="inline-flex items-center gap-2.5">
              <ServiceIcon name={service.icon} className="size-4" />
              {group?.name}
            </span>
          </Eyebrow>
        }
        title={service.h1}
        lede={<p>{service.intro}</p>}
        actions={
          <>
            <ButtonLink
              href={company.telegram.url}
              size="lg"
              data-track="contact_click"
              data-track-method="telegram"
              data-track-location={`service_${service.slug}`}
            >
              Talk to our team
            </ButtonLink>
            <ButtonLink href={routes.consult(service.slug)} variant="secondary" size="lg">
              Request a consultation
            </ButtonLink>
          </>
        }
        aside={
          <div className="rounded-2xl border border-line bg-white p-7 shadow-[var(--shadow-lift)]">
            <p className="text-eyebrow text-muted">At a glance</p>
            <ul className="mt-5 space-y-3.5">
              {service.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-[0.98rem] leading-snug text-ink-900">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-700">
                    <Check aria-hidden className="size-3" strokeWidth={2.5} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
            <p className="mt-7 border-t border-line pt-5 text-sm leading-relaxed text-muted">
              Local support for Phnom Penh, Siem Reap and on-site installations across Cambodia, in Khmer or English.
            </p>
          </div>
        }
      />

      <SectionNav items={nav} />

      {/* Overview */}
      <section id="overview" aria-labelledby="overview-title" className="scroll-mt-32 py-20 lg:py-28">
        <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5" data-reveal>
            <Eyebrow index="01">Overview</Eyebrow>
            <h2 id="overview-title" className="text-title mt-5 text-ink-950">
              {service.overview.heading}
            </h2>
          </div>
          <div className="space-y-6 lg:col-span-6 lg:col-start-7" data-reveal style={{ ["--i" as string]: 1 }}>
            {service.overview.body.map((para, i) => (
              <p key={i} className={i === 0 ? "text-lede text-ink-900" : "leading-relaxed text-muted"}>
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" aria-labelledby="capabilities-title" className="scroll-mt-32 border-t border-line bg-paper-2/50 py-20 lg:py-28">
        <div className="container-site">
          <SectionHeader eyebrow="Capabilities" index="02" id="capabilities-title" title="What’s included">
            {service.capabilitiesNote || null}
          </SectionHeader>
          <div
            className={`mt-14 columns-1 gap-4 md:columns-2 ${service.capabilities.length >= 3 ? "lg:columns-3" : ""}`}
          >
            {service.capabilities.map((group, i) => (
              <div
                key={group.title}
                data-reveal
                style={{ ["--i" as string]: i }}
                className="mb-4 break-inside-avoid rounded-2xl border border-line bg-white p-7 shadow-[var(--shadow-card)]"
              >
                <h3 className="text-eyebrow text-brand-700">{group.title}</h3>
                <ul className="mt-5 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.97rem] leading-snug text-ink-900">
                      <span aria-hidden className="mt-[0.5em] h-px w-3 shrink-0 bg-brand-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Options */}
      {service.options.length > 0 && (
        <section id="options" aria-labelledby="option-0" className="scroll-mt-32 border-t border-line py-20 lg:py-28">
          <div className="container-site space-y-20">
            {service.options.map((block, i) => (
              <div key={block.heading}>
                {i === 0 && (
                  <Eyebrow index="03" className="mb-5">
                    Options
                  </Eyebrow>
                )}
                <OptionBlockView block={block} headingId={`option-${i}`} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Process */}
      <section id="how-we-work" aria-labelledby="process-title" className="relative scroll-mt-32 overflow-hidden border-y border-line bg-gradient-to-b from-brand-50/70 to-white py-20 lg:py-28">
        <div aria-hidden className="bg-blueprint-light absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="container-site relative">
          <SectionHeader eyebrow="How we work" index={service.options.length ? "04" : "03"} id="process-title" title="Implementation and support">
            Planned with you, delivered by local engineers, and supported after go-live.
          </SectionHeader>
          <div className="mt-16">
            <ProcessSteps steps={service.process} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      {service.faqs.length > 0 && (
        <section id="faq" aria-labelledby="faq-title" className="scroll-mt-32 py-20 lg:py-28">
          <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4" data-reveal>
              <Eyebrow>Questions</Eyebrow>
              <h2 id="faq-title" className="text-title mt-5 text-ink-950">
                Common questions
              </h2>
              <p className="mt-5 leading-relaxed text-muted">
                Something else?{" "}
                <Link href={routes.consult(service.slug)} className="font-medium text-brand-700 underline decoration-brand-700/30 underline-offset-4 hover:decoration-brand-700">
                  Ask our team
                </Link>
                .
              </p>
            </div>
            <div className="lg:col-span-8">
              <Accordion items={service.faqs} />
            </div>
          </div>
        </section>
      )}

      {/* Related */}
      <section id="related" aria-labelledby="related-title" className="scroll-mt-32 border-t border-line bg-paper-2/50 py-20 lg:py-28">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
            <div>
              <Eyebrow>Related</Eyebrow>
              <h2 id="related-title" className="text-title mt-5 text-ink-950">
                Works well with
              </h2>
            </div>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {related.map((s, i) => (
              <ServiceCard key={s.slug} service={s} index={i} />
            ))}
          </div>
          {relatedCategories.length > 0 && (
            <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between" data-reveal>
              <p className="flex items-center gap-3 text-ink-900">
                <Info aria-hidden className="size-4 text-brand-700" />
                Hardware for this solution, supplied and configured by our team:
              </p>
              <ul className="flex flex-wrap gap-2">
                {relatedCategories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={routes.category(c.slug)}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-line-strong/70 px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:border-ink-900 hover:bg-ink-950 hover:text-white"
                    >
                      {c.name}
                      <ArrowRight aria-hidden className="arrow-nudge size-3.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <ContactBand
        company={company}
        title={`Talk to us about ${service.shortName}.`}
        body="Tell us what you run today and what you need. We reply in Khmer or English and confirm current options, licensing and pricing in a written quote."
        location={`service_${service.slug}_band`}
      />
    </>
  );
}
