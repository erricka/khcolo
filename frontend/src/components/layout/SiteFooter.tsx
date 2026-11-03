import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { routes } from "@/lib/site";
import type { Category, Company, Service } from "@/lib/types";

import { SocialIcon } from "./SocialIcon";

export function SiteFooter({ company, services, categories }: { company: Company; services: Service[]; categories: Category[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="surface-dark bg-grain relative overflow-hidden bg-ink-950 text-ink-300">
      <div className="container-site relative pt-20 pb-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block text-white" aria-label="KHCOLO home">
              <Logo title={null} className="h-7 w-auto" />
            </Link>
            <p className="mt-6 max-w-sm leading-relaxed text-ink-300">
              IT and telecom solutions, implementation and support for businesses across Cambodia.
            </p>
            <dl className="mt-8 space-y-4 text-sm">
              <div>
                <dt className="text-eyebrow text-ink-500">Email</dt>
                <dd className="mt-1.5">
                  <a
                    href={`mailto:${company.email}`}
                    className="link-underline text-white"
                    data-track="contact_click"
                    data-track-method="email"
                    data-track-location="footer"
                  >
                    {company.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-eyebrow text-ink-500">Phone</dt>
                <dd className="mt-1 flex flex-col tabular-nums">
                  {company.phones.map((p) => (
                    <a
                      key={p.tel}
                      href={`tel:${p.tel}`}
                      className="link-underline w-fit py-1.5 text-white"
                      data-track="contact_click"
                      data-track-method="phone"
                      data-track-location="footer"
                    >
                      {p.display}
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          <nav aria-label="Footer" className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
            <FooterColumn title="Solutions">
              {services.map((s) => (
                <FooterLink key={s.slug} href={routes.service(s.slug)}>
                  {s.shortName}
                </FooterLink>
              ))}
            </FooterColumn>
            <FooterColumn title="Products">
              {categories.map((c) => (
                <FooterLink key={c.slug} href={routes.category(c.slug)}>
                  {c.name}
                </FooterLink>
              ))}
              <FooterLink href={routes.products}>All products</FooterLink>
            </FooterColumn>
            <FooterColumn title="Company">
              <FooterLink href={routes.about}>About KHCOLO</FooterLink>
              <FooterLink href={routes.contact}>Contact</FooterLink>
              <FooterLink href={routes.privacy}>Privacy notice</FooterLink>
              <li className="pt-4">
                <a
                  href={company.telegram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 font-medium text-brand-300 hover:text-brand-200"
                  data-track="contact_click"
                  data-track-method="telegram"
                  data-track-location="footer"
                >
                  Telegram {company.telegram.handle}
                  <ArrowUpRight aria-hidden className="arrow-nudge arrow-nudge-diag size-4" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            </FooterColumn>
          </nav>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-white/[0.08] pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink-500">
            © {year} KHCOLO. Prices and availability are confirmed on quotation.
          </p>
          <ul className="relative z-10 flex items-center gap-2" aria-label="KHCOLO on social media">
            {company.socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`KHCOLO on ${s.name} (opens in a new tab)`}
                  className="flex size-10 items-center justify-center rounded-full border border-white/10 text-ink-300 transition-colors hover:border-brand-300/50 hover:text-white"
                >
                  <SocialIcon name={s.name} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Oversized wordmark, cropped by the bottom edge */}
      <div
        aria-hidden
        className="pointer-events-none relative -mt-6 -mb-[5.5vw] select-none px-4 text-white/[0.045] [mask-image:linear-gradient(to_bottom,black_30%,transparent)] sm:px-6 lg:px-10"
      >
        <Logo title={null} className="mx-auto h-auto w-full max-w-[1280px]" />
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-eyebrow text-ink-500">{title}</p>
      <ul className="mt-5 space-y-2.5 text-[0.94rem]">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="link-underline text-ink-200 transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
