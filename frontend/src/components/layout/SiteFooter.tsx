import Link from "next/link";
import { ArrowUp, Mail, Phone } from "lucide-react";

import { Logo, LogoMark } from "@/components/brand/Logo";
import { routes } from "@/lib/site";
import type { Category, Company, Service } from "@/lib/types";

import { SocialIcon } from "./SocialIcon";

type LinkItem = { href: string; label: string };
type Group = { title: string; links: LinkItem[] };

export function SiteFooter({ company, services, categories }: { company: Company; services: Service[]; categories: Category[] }) {
  const year = new Date().getFullYear();
  const group = (key: string): LinkItem[] =>
    services.filter((s) => s.group === key).map((s) => ({ href: routes.service(s.slug), label: s.shortName }));
  const groupName = (key: string) => company.solutionGroups.find((g) => g.key === key)?.name ?? key;

  const contacts = [
    {
      href: company.telegram.url,
      label: "Telegram",
      value: company.telegram.handle,
      icon: <SocialIcon name="Telegram" className="size-4" />,
      method: "telegram",
      external: true,
    },
    ...company.phones.map((p, i) => ({
      href: `tel:${p.tel}`,
      label: i === 0 ? "Sales & support" : "Alternate line",
      value: p.display,
      icon: <Phone aria-hidden className="size-4" strokeWidth={1.8} />,
      method: "phone",
      external: false,
    })),
    {
      href: `mailto:${company.email}`,
      label: "Email",
      value: company.email,
      icon: <Mail aria-hidden className="size-4" strokeWidth={1.8} />,
      method: "email",
      external: false,
    },
  ];

  const columns: Group[][] = [
    [{ title: groupName("communications"), links: group("communications") }],
    [{ title: groupName("security"), links: group("security") }],
    [
      { title: groupName("cloud"), links: group("cloud") },
      { title: groupName("managed-it"), links: group("managed-it") },
    ],
    [
      {
        title: "Products",
        links: [
          ...categories.map((c) => ({ href: routes.category(c.slug), label: c.name })),
          { href: routes.products, label: "All products" },
        ],
      },
    ],
    [
      {
        title: "Company",
        links: [
          { href: routes.about, label: "About KHCOLO" },
          { href: routes.contact, label: "Contact" },
          { href: `${routes.contact}#inquiry`, label: "Request a quote" },
          { href: routes.privacy, label: "Privacy notice" },
        ],
      },
    ],
  ];

  return (
    <footer className="relative border-t border-line bg-white text-ink-900">
      <div className="container-site pt-16 pb-8 lg:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand and direct contact */}
          <div className="lg:col-span-4 lg:pr-8">
            <Link href="/" className="inline-block" aria-label="KHCOLO home">
              <Logo title={null} id="logo-footer" className="h-8 w-auto" />
            </Link>
            <p className="mt-5 max-w-sm leading-relaxed text-muted">
              3CX phone systems, Bitrix24 CRM, security, cloud and IT support for businesses across Cambodia, from one
              local team.
            </p>
            <p className="mt-4 font-mono text-[0.7rem] leading-relaxed tracking-[0.05em] text-muted uppercase">
              Serving businesses across Cambodia
            </p>
            <ul className="mt-7 divide-y divide-line border-y border-line">
              {contacts.map((c) => (
                <li key={c.href}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    data-track="contact_click"
                    data-track-method={c.method}
                    data-track-location="footer"
                    className="group flex min-h-12 items-center gap-3 py-2.5 transition-colors hover:text-brand-700"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      {c.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-eyebrow block text-[0.68rem] text-muted">{c.label}</span>
                      <span className="mt-0.5 block truncate text-[0.94rem] tabular-nums">{c.value}</span>
                    </span>
                    {c.external && <span className="sr-only">(opens in a new tab)</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Site map */}
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-5">
            {columns.map((col, ci) => (
              <div key={ci} className="space-y-9">
                {col.map((g) => (
                  <div key={g.title}>
                    <p className="text-[0.95rem] text-ink-950">{g.title}</p>
                    <ul className="mt-4 space-y-3 text-[0.92rem]">
                      {g.links.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} className="text-muted transition-colors hover:text-ink-950">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {ci === columns.length - 1 && (
                  <div>
                    <p className="text-[0.95rem] text-ink-950">Socials</p>
                    <ul className="mt-4 space-y-3 text-[0.92rem]" aria-label="KHCOLO on social media">
                      {company.socials.map((sc) => (
                        <li key={sc.name}>
                          <a
                            href={sc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-muted transition-colors hover:text-ink-950"
                          >
                            <SocialIcon name={sc.name} className="size-3.5" />
                            {sc.name}
                            <span className="sr-only">(opens in a new tab)</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-line pt-6 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <LogoMark id="mark-footer" className="size-6" />
              <span className="inline-flex items-center gap-2 text-accent-700">
                <span aria-hidden className="status-dot size-2 rounded-full bg-accent-500" />
                Local support in <span lang="km">ខ្មែរ</span> and English
              </span>
            </div>
            <a
              href="#main"
              className="group inline-flex h-9 items-center gap-1.5 border border-line px-3 text-ink-900 transition-colors hover:border-ink-950"
            >
              <ArrowUp aria-hidden className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
              Back to top
            </a>
          </div>
          <div className="mt-5 flex flex-col gap-1.5 text-muted lg:flex-row lg:flex-wrap lg:gap-x-6">
            <span>© {year} KHCOLO. All rights reserved.</span>
            <span>Prices and availability confirmed on quotation.</span>
            <span>Phone lines and numbers are provided by licensed telecom operators.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
