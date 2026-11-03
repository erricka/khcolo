import type { Metadata } from "next";
import { ArrowDown } from "lucide-react";

import { CorePlatforms } from "@/components/home/CorePlatforms";
import { HeroTopology } from "@/components/home/HeroTopology";
import { CategoryCard } from "@/components/products/CategoryCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ButtonLink } from "@/components/ui/Button";
import { ContactBand } from "@/components/ui/ContactBand";
import { ProcessSteps } from "@/components/ui/ProcessSteps";
import { Eyebrow, SectionHeader } from "@/components/ui/Section";
import { getCategories, getCompany, getPage, getProducts, getServices } from "@/lib/content";
import { CORE_KEYWORDS, organizationLd, pageMetadata, websiteLd } from "@/lib/seo";
import { brandLabel, CATEGORY_HERO_PRODUCT, routes } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("/");
  return pageMetadata({ title: page.title, description: page.description, path: "/", keywords: CORE_KEYWORDS });
}

const HOW_WE_WORK = [
  { title: "Survey", body: "We look at what you run today: rooms, users, numbers, servers and the risks around them." },
  { title: "Design and quote", body: "A clear recommendation covering licensing, hardware and the work involved." },
  { title: "Install and configure", body: "Cabling, setup, migration and calibration, carried out by local engineers." },
  { title: "Train and hand over", body: "Your staff learn the system and you receive documentation for it." },
  { title: "Support and maintain", body: "Renewals, updates, preventive checks and help when something needs attention." },
];


export default async function HomePage() {
  const [company, services, categories, products] = await Promise.all([
    getCompany(),
    getServices(),
    getCategories(),
    getProducts(),
  ]);
  const threecx = services.find((s) => s.slug === "cloud-call-center");
  const bitrix = services.find((s) => s.slug === "3cx-bitrix24-integration");

  return (
    <>
      <JsonLd data={[organizationLd(company), websiteLd()]} />

      {/* Hero ------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-white">
        <div
          aria-hidden
          className="bg-blueprint-light absolute inset-0 [mask-image:radial-gradient(ellipse_65%_70%_at_72%_42%,black_20%,transparent_75%)]"
        />
        <div
          aria-hidden
          className="absolute top-[-18rem] right-[-12rem] size-[52rem] rounded-full bg-[radial-gradient(closest-side,rgb(61_104_242/0.13),transparent)]"
        />
        <div
          aria-hidden
          className="absolute bottom-[-20rem] left-[-14rem] size-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(16_185_129/0.07),transparent)]"
        />
        <div className="container-site relative grid items-center gap-10 pt-[calc(var(--header-h)+3.5rem)] pb-14 lg:grid-cols-12 lg:gap-6 lg:pt-[calc(var(--header-h)+4.5rem)] lg:pb-20">
          <div className="lg:col-span-7">
            <p className="enter text-eyebrow flex items-center gap-3 text-brand-600" style={{ ["--d" as string]: 0 }}>
              <span className="relative flex size-2">
                <span className="motion-decor absolute inline-flex size-full animate-ping rounded-full bg-accent-500 opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-accent-500" />
              </span>
              3CX · Bitrix24 · IT support in Cambodia
            </p>
            <h1 className="text-display mt-7 max-w-[17ch] text-[clamp(2.5rem,1.2rem+3.9vw,4.35rem)] text-ink-950">
              3CX, Bitrix24 and{" "}
              <em className="relative inline-block bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text not-italic text-transparent">
                local IT support
                <svg
                  aria-hidden
                  viewBox="0 0 300 14"
                  preserveAspectRatio="none"
                  className="absolute -bottom-[0.06em] left-[2%] h-[0.16em] w-[96%] overflow-visible"
                >
                  <path
                    d="M2 9.5C48 4.5 96 3 150 4.2c52 1.2 98 3.3 146 1.6"
                    pathLength={1}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.6}
                    strokeLinecap="round"
                    className="draw-underline text-accent-500"
                  />
                </svg>
              </em>{" "}
              for
              Cambodian businesses
            </h1>
            <p className="text-lede mt-7 max-w-[34rem] text-muted">
              3CX phone systems, Bitrix24 CRM, cybersecurity, backup, hosting and IT maintenance, planned, installed and
              supported by one local team, in Khmer or English.
            </p>
            <div className="enter mt-9 flex flex-wrap gap-3" style={{ ["--d" as string]: 2 }}>
              <ButtonLink
                href={company.telegram.url}
                size="lg"
                data-track="contact_click"
                data-track-method="telegram"
                data-track-location="hero"
              >
                Talk to our team
              </ButtonLink>
              <ButtonLink href="#solutions" variant="secondary" size="lg" icon={<ArrowDown aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-y-0.5" />}>
                Explore solutions
              </ButtonLink>
            </div>
            <dl
              className="enter mt-12 grid max-w-[34rem] divide-y divide-line border-t border-line sm:mt-14 sm:grid-cols-3 sm:divide-y-0 sm:pt-6"
              style={{ ["--d" as string]: 3 }}
            >
              {[
                ["Since 2017", "Operating in Cambodia"],
                ["Khmer · English", "Support languages"],
                ["Nationwide", "On-site installation"],
              ].map(([k, v], i) => (
                <div
                  key={k}
                  className={`flex items-baseline justify-between gap-4 py-3.5 sm:block sm:py-0 ${
                    i ? "sm:border-l sm:border-line sm:pl-6" : "sm:pr-4"
                  }`}
                >
                  <dt className="font-medium tracking-tight text-ink-950">{k}</dt>
                  <dd className="text-[0.85rem] leading-snug text-muted sm:mt-1 sm:text-[0.8rem]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          {/* Decorative; too small to read on phones, so it starts at the sm breakpoint. */}
          <div className="enter hidden sm:block lg:col-span-5" style={{ ["--d" as string]: 1 }}>
            <HeroTopology className="mx-auto w-full max-w-[600px] lg:max-w-none" tilt />
          </div>
        </div>

        {/* Partner programs */}
        <div className="relative border-y border-line bg-paper/70">
          <div className="container-site grid grid-cols-1 gap-6 py-8 lg:grid-cols-12 lg:items-center lg:gap-10">
            <p className="text-eyebrow text-muted lg:col-span-2">Partners &amp; platforms</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 lg:col-span-10 lg:grid-cols-7">
              {company.partners.map((p, i) => (
                <li key={p.vendor} data-reveal style={{ ["--i" as string]: i }}>
                  <span className="block text-[1.05rem] font-semibold tracking-tight text-ink-950">{p.vendor}</span>
                  <span className="mt-1 block text-[0.78rem] leading-snug text-muted">{p.relationship}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Core platforms: 3CX + Bitrix24 ---------------------------------- */}
      {threecx && bitrix && <CorePlatforms threecx={threecx} bitrix={bitrix} />}

      {/* Solutions -------------------------------------------------------- */}
      <section id="solutions" aria-labelledby="solutions-title" className="py-24 lg:py-32">
        <div className="container-site">
          <SectionHeader
            eyebrow="Solutions"
            index="01"
            id="solutions-title"
            title="One accountable team for the systems your business runs on."
          >
            3CX phone system, Bitrix24 CRM, security, email and hosting, licensed, deployed and supported locally. One
            number to call instead of a different vendor for each.
          </SectionHeader>

          <div className="mt-16 divide-y divide-line border-y border-line lg:mt-20">
            {company.solutionGroups.map((g, gi) => {
              const items = services.filter((s) => s.group === g.key);
              return (
                <div key={g.key} className="grid gap-8 py-10 lg:grid-cols-12 lg:gap-10 lg:py-14">
                  <div className="lg:col-span-3" data-reveal>
                    <p className="text-xs font-semibold tracking-[0.08em] text-ink-500 tabular-nums">
                      0{gi + 1} / 0{company.solutionGroups.length}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink-950">{g.name}</h3>
                    <p className="mt-3 max-w-xs leading-relaxed text-muted">{g.need}</p>
                  </div>
                  <div className={`grid gap-4 sm:grid-cols-2 lg:col-span-9 ${items.length >= 3 ? "xl:grid-cols-3" : ""}`}>
                    {items.map((s, i) => (
                      <ServiceCard key={s.slug} service={s} index={i} wide={items.length === 1} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hardware --------------------------------------------------------- */}
      <section aria-labelledby="hardware-title" className="relative overflow-hidden border-y border-line bg-paper/60 py-24 lg:py-32">
        <div aria-hidden className="bg-blueprint-light absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
        <div className="container-site relative">
          <SectionHeader
            eyebrow="Hardware"
            index="02"
            id="hardware-title"
            title="Phones, gateways and PBX appliances, supplied and set up."
          >
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
          <div className="mt-10" data-reveal>
            <ButtonLink href={routes.products} variant="dark">
              Browse all {products.length} products
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* How we work ------------------------------------------------------ */}
      <section aria-labelledby="approach-title" className="py-24 lg:py-32">
        <div className="container-site">
          <SectionHeader eyebrow="How we work" index="03" id="approach-title" title="From the first survey to ongoing support.">
            The engineers who design your environment are the same people who answer when something needs attention. No
            handoffs between vendors.
          </SectionHeader>
          <div className="mt-16 lg:mt-20">
            <ProcessSteps steps={HOW_WE_WORK} />
          </div>
        </div>
      </section>

      {/* Company ---------------------------------------------------------- */}
      <section aria-labelledby="about-title" className="pb-24 lg:pb-32">
        <div className="container-site">
          <div className="grid overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-[var(--shadow-card)] lg:grid-cols-12">
            <div className="p-7 sm:p-12 lg:col-span-7 lg:p-16" data-reveal>
              <Eyebrow index="04">About KHCOLO</Eyebrow>
              <h2 id="about-title" className="text-title mt-5 text-ink-950">
                The full stack, under one roof.
              </h2>
              <p className="text-lede mt-6 max-w-2xl text-muted">{company.description}</p>
              <ul className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
                {company.principles.map((p) => (
                  <li key={p.title} className="border-t border-line pt-5">
                    <h3 className="font-semibold tracking-tight text-ink-950">{p.title}</h3>
                    <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{p.body}</p>
                  </li>
                ))}
              </ul>
              <ButtonLink href={routes.about} variant="outline" className="mt-10">
                More about KHCOLO
              </ButtonLink>
            </div>
            <div className="relative border-t border-line bg-gradient-to-b from-brand-50 to-white p-7 sm:p-12 lg:col-span-5 lg:border-t-0 lg:border-l lg:p-14" data-reveal style={{ ["--i" as string]: 1 }}>
              <div aria-hidden className="bg-blueprint-light absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
              <div className="relative flex h-full flex-col gap-9">
              <dl className="space-y-9">
                <div>
                  <dt className="text-eyebrow text-muted">Operating since</dt>
                  <dd className="mt-3 text-7xl leading-none font-semibold tracking-[-0.04em] text-brand-600 tabular-nums">{company.operatingSince}</dd>
                </div>
                <div className="border-t border-brand-600/10 pt-7">
                  <dt className="text-eyebrow text-muted">Where we work</dt>
                  <dd className="mt-3 space-y-1.5">
                    {company.serviceAreas.map((a) => (
                      <p key={a.name} className="flex items-baseline justify-between gap-4">
                        <span className="text-lg font-medium text-ink-950">{a.name}</span>
                        <span className="text-sm text-muted">{a.note}</span>
                      </p>
                    ))}
                  </dd>
                </div>
                <div className="border-t border-brand-600/10 pt-7">
                  <dt className="text-eyebrow text-muted">Support languages</dt>
                  <dd className="mt-3 flex items-baseline gap-6 text-lg font-medium text-ink-950">
                    <span>
                      <span lang="km">ខ្មែរ</span> <span className="text-muted">Khmer</span>
                    </span>
                    <span>English</span>
                  </dd>
                </div>
              </dl>
                <blockquote className="mt-auto border-t border-brand-600/10 pt-7">
                  <span aria-hidden className="block text-5xl leading-none font-semibold text-accent-500">&ldquo;</span>
                  <p className="mt-1 text-xl leading-snug font-medium tracking-[-0.015em] text-ink-950">
                    We believe trust can only be achieved through communication and experienced support.
                  </p>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactBand company={company} />
    </>
  );
}
