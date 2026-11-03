import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Page not found — KHCOLO" },
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/#solutions", label: "Solutions", body: "Phone systems, CRM, security, cloud and IT maintenance" },
  { href: routes.products, label: "Products", body: "IP phones, VoIP gateways and IP PBX appliances" },
  { href: routes.contact, label: "Contact", body: "Telegram, phone, email or the inquiry form" },
];

export default function NotFound() {
  return (
    <section className="surface-dark bg-grain relative min-h-[80vh] overflow-hidden bg-ink-950 text-white">
      <div aria-hidden className="bg-blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="container-site relative pt-[calc(var(--header-h)+5rem)] pb-24">
        <p className="text-eyebrow text-brand-300">Error 404</p>
        <h1 className="text-display-sm mt-6 max-w-[16ch]">This page isn&rsquo;t here.</h1>
        <p className="text-lede mt-6 max-w-xl text-ink-300">
          The link may be old or the page may have moved during our redesign. These are good places to continue:
        </p>
        <ul className="mt-12 grid max-w-4xl gap-3 md:grid-cols-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group flex h-full flex-col rounded-2xl border border-white/[0.09] bg-white/[0.03] p-6 transition-[border-color,background-color] hover:border-brand-300/40 hover:bg-white/[0.06]"
              >
                <span className="flex items-center justify-between font-medium">
                  {l.label}
                  <ArrowRight aria-hidden className="arrow-nudge size-4 text-brand-300" />
                </span>
                <span className="mt-2 text-sm leading-relaxed text-ink-400">{l.body}</span>
              </Link>
            </li>
          ))}
        </ul>
        <ButtonLink href="/" variant="secondary" className="mt-10">
          Back to the homepage
        </ButtonLink>
      </div>
    </section>
  );
}
