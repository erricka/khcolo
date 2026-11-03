import Link from "next/link";
import { ArrowUp, Mail, Phone } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
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

  // Three balanced columns, each holding two short groups.
  const columns: Group[][] = [
    [
      { title: groupName("communications"), links: group("communications") },
      { title: groupName("security"), links: group("security") },
    ],
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
      {
        title: "Company",
        links: [
          { href: routes.about, label: "About KHCOLO" },
          { href: routes.contact, label: "Contact" },
          { href: routes.privacy, label: "Privacy notice" },
        ],
      },
    ],
  ];

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

  return (
    <footer className="surface-dark relative overflow-hidden bg-ink-950 text-ink-300">
      {/* Brand accent along the top edge */}
      <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-brand-500 to-accent-400/70" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 left-1/2 h-72 w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(61_104_242/0.14),transparent)]"
      />

      <div className="container-site relative pt-16 pb-8 lg:pt-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Brand and contact */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block text-white" aria-label="KHCOLO home">
              <Logo title={null} className="h-8 w-auto" />
            </Link>
            <p className="mt-5 max-w-sm leading-relaxed text-ink-300">
              3CX phone systems, Bitrix24 CRM, security, cloud and IT support for businesses across Cambodia, from one
              local team.
            </p>

            <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {contacts.map((c) => (
                <li key={c.href}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    data-track="contact_click"
                    data-track-method={c.method}
                    data-track-location="footer"
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-3 transition-colors hover:border-brand-400/40 hover:bg-white/[0.05]"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300 transition-colors group-hover:bg-brand-500/25">
                      {c.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.7rem] font-semibold tracking-[0.08em] text-ink-400 uppercase">{c.label}</span>
                      <span className="mt-0.5 block truncate text-[0.92rem] font-medium text-white tabular-nums">{c.value}</span>
                    </span>
                    {c.external && <span className="sr-only">(opens in a new tab)</span>}
                  </a>
                </li>
              ))}
            </ul>

            <ul className="mt-6 flex items-center gap-2" aria-label="KHCOLO on social media">
              {company.socials.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`KHCOLO on ${s.name} (opens in a new tab)`}
                    className="flex size-10 items-center justify-center rounded-full border border-white/10 text-ink-300 transition-colors hover:border-brand-400/50 hover:bg-white/[0.04] hover:text-white"
                  >
                    <SocialIcon name={s.name} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Site map */}
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:col-span-7">
            {columns.map((col, ci) => (
              <div key={ci} className="space-y-10">
                {col.map((g) => (
                  <div key={g.title}>
                    <p className="text-eyebrow text-brand-300">{g.title}</p>
                    <ul className="mt-4 space-y-2.5 text-[0.94rem]">
                      {g.links.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} className="link-underline text-ink-200 transition-colors hover:text-white">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col gap-5 border-t border-white/[0.08] pt-7 text-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1.5 text-ink-400 sm:flex-row sm:items-center sm:gap-3">
            <span>© {year} KHCOLO. All rights reserved.</span>
            <span aria-hidden className="hidden text-ink-600 sm:inline">
              ·
            </span>
            <span>Prices and availability confirmed on quotation.</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="text-ink-400">
              Phnom Penh · Siem Reap · <span lang="km">ខ្មែរ</span> / English
            </span>
            <a
              href="#main"
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-2 text-ink-200 transition-colors hover:border-brand-400/50 hover:text-white"
            >
              <ArrowUp aria-hidden className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
              Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
