import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { Eyebrow } from "@/components/ui/Section";
import { getCompany, getPage } from "@/lib/content";
import { pageMetadata, webPageLd } from "@/lib/seo";
import { routes } from "@/lib/site";

export const revalidate = 3600;

const PATH = "/privacy-policy/";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(PATH);
  return pageMetadata({ title: page.title, description: page.description, path: PATH });
}

export default async function PrivacyPage() {
  const [page, company] = await Promise.all([getPage(PATH), getCompany()]);
  const updated = new Date(page.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const sections: { title: string; body: React.ReactNode }[] = [
    {
      title: "What we collect",
      body: (
        <>
          <p>When you send the inquiry form we collect what you enter: your name, company, email address and/or phone number, preferred contact method, the topic and product you chose, and your message.</p>
          <p>To protect the form from abuse we also store a one-way hash of your IP address and your browser&rsquo;s user-agent string. We cannot recover your IP address from the hash.</p>
        </>
      ),
    },
    {
      title: "Why we use it",
      body: <p>Only to reply to your request: answering questions, preparing quotes and arranging consultations or site visits. We do not sell your details or add you to marketing lists from this form.</p>,
    },
    {
      title: "Who can see it",
      body: (
        <p>
          Inquiries are stored in our own database and are visible only to KHCOLO staff who handle sales and support. If we
          enable notifications, a copy of your request is sent to our team&rsquo;s internal email or Telegram so we can
          respond quickly.
        </p>
      ),
    },
    {
      title: "Analytics",
      body: <p>If we measure how the site is used, we record actions such as &ldquo;inquiry sent&rdquo; or &ldquo;phone link clicked&rdquo;. These events never include your name, contact details or message.</p>,
    },
    {
      title: "How long we keep it",
      body: <p>We keep inquiries for as long as we need them to respond and maintain normal business records. You can ask us to delete your inquiry at any time.</p>,
    },
    {
      title: "Your choices",
      body: (
        <p>
          To see, correct or delete the information you sent, email{" "}
          <a href={`mailto:${company.email}`} className="font-medium text-brand-700 underline underline-offset-2">
            {company.email}
          </a>{" "}
          or call {company.phones[0].display}. You can also contact us without the form, by{" "}
          <Link href={routes.contact} className="font-medium text-brand-700 underline underline-offset-2">
            phone, email or Telegram
          </Link>
          .
        </p>
      ),
    },
  ];

  return (
    <>
      <JsonLd data={webPageLd("WebPage", { name: page.h1, path: PATH, description: page.description })} />
      <PageHero
        compact
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Privacy notice", path: PATH },
        ]}
        eyebrow={<Eyebrow tone="dark">Last updated {updated}</Eyebrow>}
        title={page.h1}
        lede={<p>How we handle the information you send through this website.</p>}
      />
      <section className="py-16 lg:py-24">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
          <nav aria-label="Sections" className="hidden lg:col-span-3 lg:block">
            <ol className="sticky top-[calc(var(--header-h)+2rem)] space-y-2 text-sm">
              {sections.map((s, i) => (
                <li key={s.title}>
                  <a href={`#p-${i}`} className="text-muted hover:text-ink-950">
                    <span className="text-xs font-semibold text-ink-400 tabular-nums">0{i + 1}</span> {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="max-w-2xl space-y-12 lg:col-span-8 lg:col-start-5">
            {sections.map((s, i) => (
              <section key={s.title} id={`p-${i}`} aria-labelledby={`p-${i}-title`} className="scroll-mt-32">
                <Eyebrow index={`0${i + 1}`}>{s.title}</Eyebrow>
                <h2 id={`p-${i}-title`} className="sr-only">
                  {s.title}
                </h2>
                <div className="mt-4 space-y-4 text-[1.05rem] leading-relaxed text-ink-900">{s.body}</div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
