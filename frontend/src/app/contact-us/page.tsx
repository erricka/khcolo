import type { Metadata } from "next";
import { ArrowUpRight, Mail, Phone } from "lucide-react";

import { InquiryForm } from "@/components/contact/InquiryForm";
import { SocialIcon } from "@/components/layout/SocialIcon";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { Eyebrow } from "@/components/ui/Section";
import { getCategories, getCompany, getPage, getProducts, getServices } from "@/lib/content";
import { pageMetadata, webPageLd } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/contact-us/";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(PATH);
  return pageMetadata({ title: page.title, description: page.description, path: PATH });
}

export default async function ContactPage() {
  const [page, company, services, categories, products] = await Promise.all([
    getPage(PATH),
    getCompany(),
    getServices(),
    getCategories(),
    getProducts(),
  ]);

  // Topics follow the public services only; groups with no public service are left out.
  const topics = [
    ...company.solutionGroups.filter((g) => services.some((s) => s.group === g.key)).map((g) => ({
      label: g.name,
      options: services.filter((s) => s.group === g.key).map((s) => ({ value: s.slug, label: s.shortName })),
    })),
    {
      label: "Other",
      options: [
        { value: "general", label: "Something else" },
      ],
    },
  ];
  const productGroups = categories.map((c) => ({
    label: c.name,
    options: products.filter((p) => p.category === c.slug).map((p) => ({ value: p.slug, label: p.name })),
  }));

  const methods = [
    {
      label: "Telegram",
      value: company.telegram.handle,
      note: "Fastest for sales questions",
      href: company.telegram.url,
      icon: <SocialIcon name="Telegram" className="size-5" />,
      method: "telegram",
      primary: true,
    },
    ...company.phones.map((p, i) => ({
      label: i === 0 ? "Phone" : "Phone (alternate)",
      value: p.display,
      note: "Khmer or English",
      href: `tel:${p.tel}`,
      icon: <Phone aria-hidden className="size-5" strokeWidth={1.6} />,
      method: "phone",
      primary: false,
    })),
    {
      label: "Email",
      value: company.email,
      note: "Sales and support",
      href: `mailto:${company.email}`,
      icon: <Mail aria-hidden className="size-5" strokeWidth={1.6} />,
      method: "email",
      primary: false,
    },
  ];

  return (
    <>
      <JsonLd data={webPageLd("ContactPage", { name: page.h1, path: PATH, description: page.description })} />

      <PageHero
        compact
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: PATH },
        ]}
        eyebrow={<Eyebrow>Contact</Eyebrow>}
        title={page.h1}
        lede={
          <p>
            Tell us what you run today and what you need. Message us directly or send the form below, and our team will
            reply in Khmer or English.
          </p>
        }
      >
        <ul className="mt-14 grid border-t border-l border-line sm:grid-cols-2 lg:grid-cols-4">
          {methods.map((m, i) => {
            const external = m.href.startsWith("http");
            return (
              <li key={m.href} className="enter" style={{ ["--d" as string]: 2 + i * 0.5 }}>
                <a
                  href={m.href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  data-track="contact_click"
                  data-track-method={m.method}
                  data-track-location="contact_page"
                  data-spotlight
                  className={`group relative flex h-full flex-col border-r border-b border-line p-6 transition-colors duration-200 ${
                    m.primary ? "bg-brand-50 hover:bg-brand-100" : "bg-white hover:bg-paper-2"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className="text-eyebrow text-muted">{m.label}</span>
                    <span
                      className={`flex size-9 items-center justify-center transition-colors ${
                        m.primary ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white"
                      }`}
                    >
                      {m.icon}
                    </span>
                  </span>
                  <span className="mt-8 inline-flex items-center gap-1.5 text-[1.1rem] tracking-[-0.01em] text-ink-950 tabular-nums">
                    {m.value}
                    {external && <ArrowUpRight aria-hidden className="arrow-nudge arrow-nudge-diag size-4 text-ink-400" />}
                  </span>
                  <span className="mt-1 text-sm text-muted">{m.note}</span>
                  {external && <span className="sr-only">(opens in a new tab)</span>}
                </a>
              </li>
            );
          })}
        </ul>
      </PageHero>

      <section aria-labelledby="inquiry-title" className="py-16 lg:py-24">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div id="inquiry" className="scroll-mt-28 lg:col-span-7">
            <div className="border border-line bg-white p-6 sm:p-10">
              <Eyebrow>Inquiry or appointment request</Eyebrow>
              <h2 id="inquiry-title" className="text-title mt-5 text-ink-950">
                Send us your request
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-muted">
                Ask a question, request a quote, or ask for a consultation or site visit. We&rsquo;ll get back to you to
                confirm details and arrange a time.
              </p>
              <div className="mt-10">
                <InquiryForm topics={topics} products={productGroups} />
              </div>
            </div>
          </div>

          <aside className="space-y-12 lg:col-span-5 lg:pt-4" aria-label="What to expect">
            <div data-reveal>
              <Eyebrow>What happens next</Eyebrow>
              <ol className="mt-6 space-y-6">
                {[
                  ["We read your request", "Every request goes to our sales and support team."],
                  ["We get in touch", "By your preferred channel, in Khmer or English."],
                  ["We agree next steps", "A quote, a call, or a time for a consultation or site visit."],
                ].map(([title, body], i) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex size-7 shrink-0 items-center justify-center bg-brand-600 font-mono text-xs text-white tabular-nums">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block text-[1.05rem] tracking-[-0.01em] text-ink-950">{title}</span>
                      <span className="mt-1 block leading-relaxed text-muted">{body}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 border-l-2 border-brand-600 bg-brand-50 p-4 text-sm leading-relaxed text-ink-700">
                Sending the form doesn&rsquo;t book an appointment. We&rsquo;ll contact you to confirm a time that works.
              </p>
            </div>

            <div className="border-t border-line pt-10" data-reveal>
              <Eyebrow>Where we work</Eyebrow>
              <ul className="mt-6 space-y-3">
                {company.serviceAreas.map((a) => (
                  <li key={a.name} className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                    <span className="text-ink-950">{a.name}</span>
                    <span className="text-sm text-muted">{a.note}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted">
                Support in <span lang="km">ខ្មែរ</span> Khmer and English.
              </p>
            </div>

            <div className="border-t border-line pt-10" data-reveal>
              <Eyebrow>Follow KHCOLO</Eyebrow>
              <ul className="mt-5 flex flex-wrap gap-2">
                {company.socials.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 items-center gap-2 border border-ink-950 bg-white px-4 text-sm text-ink-950 transition-colors hover:bg-ink-950 hover:text-white"
                    >
                      <SocialIcon name={s.name} />
                      {s.name}
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
