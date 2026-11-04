import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { JsonLd } from "@/components/seo/JsonLd";
import { ContactBand } from "@/components/ui/ContactBand";
import { PageHero } from "@/components/ui/PageHero";
import { Eyebrow, SectionHeader } from "@/components/ui/Section";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { getCompany, getPage, getServices } from "@/lib/content";
import { pageMetadata, webPageLd } from "@/lib/seo";
import { routes } from "@/lib/site";

export const revalidate = 3600;

const PATH = "/about-us/";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(PATH);
  return pageMetadata({ title: page.title, description: page.description, path: PATH });
}

export default async function AboutPage() {
  const [page, company, services] = await Promise.all([getPage(PATH), getCompany(), getServices()]);
  const groups = company.solutionGroups.filter((g) => services.some((s) => s.group === g.key));

  return (
    <>
      <JsonLd data={webPageLd("AboutPage", { name: page.h1, path: PATH, description: page.description })} />

      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: PATH },
        ]}
        eyebrow={<Eyebrow>About us</Eyebrow>}
        title={page.h1}
        lede={
          <>
            <p className="text-[clamp(1.5rem,1.2rem+1.2vw,2.15rem)] leading-tight tracking-[-0.025em] text-brand-700">
              Phone system and CRM, under one roof.
            </p>
            <p className="mt-6">
              KHCOLO is a Cambodia-based IT solutions company. We configure 3CX phone systems and implement Bitrix24 CRM
              workflows, supported by one local team, so there is one point of contact for both.
            </p>
          </>
        }
        aside={
          <dl className="divide-y divide-line border border-line bg-white px-7">
            {[
              ["Project areas", `${company.serviceAreas.map((a) => a.name).join(" and ")}, by agreement`],
              ["Support languages", "Khmer · English"],
              ["Contact", company.email],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1.5 py-5">
                <dt className="text-eyebrow text-muted">{k}</dt>
                <dd className="text-[1.05rem] text-ink-950">{v}</dd>
              </div>
            ))}
          </dl>
        }
      />

      <section aria-labelledby="story-title" className="py-20 lg:py-28">
        <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5" data-reveal>
            <Eyebrow index="01">Who we are</Eyebrow>
            <h2 id="story-title" className="text-title mt-5 text-ink-950">
              Built so your team can focus on customers.
            </h2>
          </div>
          <div className="space-y-6 lg:col-span-6 lg:col-start-7" data-reveal style={{ ["--i" as string]: 1 }}>
            <p className="text-lede text-ink-900">
              Whether it&rsquo;s a call queue going live or a sales pipeline that needs a new stage, the team that
              designed your setup is the one that answers.
            </p>
            <p className="leading-relaxed text-muted">
              We hold ourselves to that standard on every engagement, from a single office to a multi-branch 3CX rollout.
              We configure 3CX and Bitrix24 to work together and support both locally. Calls, phone numbers and
              connectivity are supplied separately by your authorized provider.
            </p>
            <p className="leading-relaxed text-muted">
              Trust is built through communication and support. That&rsquo;s why you talk to a local engineer directly,
              in Khmer or English, with no overseas ticket queue.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="what-title" className="border-t border-line bg-paper-2/50 py-20 lg:py-28">
        <div className="container-site">
          <SectionHeader eyebrow="What we do" index="02" id="what-title" title="Phone system and CRM, one team.">
            Each service links to its own page with capabilities, options and how we deliver it.
          </SectionHeader>
          <div className={`mt-14 grid gap-4 ${groups.length > 1 ? "md:grid-cols-2" : ""}`}>
            {groups.map((g, i) => (
              <div
                key={g.key}
                data-reveal
                style={{ ["--i" as string]: i }}
                className={`border border-line bg-white p-7 sm:p-8 ${groups.length === 1 ? "lg:grid lg:grid-cols-12 lg:gap-8" : ""}`}
              >
                <div className={groups.length === 1 ? "lg:col-span-5" : ""}>
                  {groups.length > 1 && (
                    <p className="mb-5 flex size-6 items-center justify-center bg-brand-600 font-mono text-[0.72rem] text-white tabular-nums">{i + 1}</p>
                  )}
                  <h3 className="text-[1.6rem] tracking-[-0.025em] text-ink-950">{g.name}</h3>
                  <p className="mt-2 max-w-md leading-relaxed text-muted">{g.summary}</p>
                </div>
                <ul className={`mt-6 divide-y divide-line border-t border-line ${groups.length === 1 ? "lg:col-span-7 lg:mt-0 lg:border-t-0" : ""}`}>
                  {services
                    .filter((s) => s.group === g.key)
                    .map((s) => (
                      <li key={s.slug} className={groups.length === 1 ? "lg:first:pt-0" : ""}>
                        <Link href={routes.service(s.slug)} className="group flex items-start gap-3 py-4 text-ink-900 hover:text-brand-700">
                          <ServiceIcon name={s.icon} className="mt-1 size-4 shrink-0 text-brand-700" />
                          <span className="flex-1">
                            <span className="block">{s.shortName}</span>
                            {groups.length === 1 && <span className="mt-1 block text-[0.95rem] leading-relaxed text-muted">{s.summary}</span>}
                          </span>
                          <ArrowRight aria-hidden className="arrow-nudge mt-1 size-4 shrink-0 text-ink-400 group-hover:text-brand-700" />
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="principles-title" className="bg-tint relative overflow-hidden border-y border-brand-100 py-20 lg:py-28">
        <div className="container-site relative">
          <SectionHeader eyebrow="How we work" index="03" id="principles-title" title="What you can expect from us." />
          <ul className="mt-14 grid border-t border-l border-brand-200/70 md:grid-cols-3">
            {company.principles.map((p, i) => (
              <li key={p.title} data-reveal style={{ ["--i" as string]: i }} className="border-r border-b border-brand-200/70 bg-white/70 p-7 lg:p-8">
                <span className="flex size-6 items-center justify-center bg-brand-600 font-mono text-[0.72rem] text-white tabular-nums">{i + 1}</span>
                <h3 className="mt-8 text-[1.2rem] tracking-[-0.015em] text-ink-950">{p.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="partners" aria-labelledby="partners-title" className="scroll-mt-24 py-20 lg:py-28">
        <div className="container-site">
          <SectionHeader eyebrow="Platforms" index="04" id="partners-title" title="The platforms we configure.">
            3CX and Bitrix24 are products of their own vendors. We configure and support them for your business.
          </SectionHeader>
          <ul className="mt-14 grid border-t border-l border-line sm:grid-cols-2">
            {company.partners.map((p, i) => (
              <li
                key={p.vendor}
                data-reveal
                style={{ ["--i" as string]: i }}
                className="flex flex-col border-r border-b border-line bg-white p-7"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-[1.6rem] tracking-[-0.03em] text-ink-950">{p.vendor}</h3>
                  <span className="text-eyebrow text-right text-brand-700">{p.relationship}</span>
                </div>
                <p className="mt-4 leading-relaxed text-muted">{p.scope}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ContactBand company={company} title="Trust, built through communication." body="Tell us how calls and sales work in your business today. We’ll take it from there." location="about_band" />
    </>
  );
}
