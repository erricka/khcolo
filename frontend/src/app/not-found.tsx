import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { PixelBlock } from "@/components/ui/Pixels";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Page not found — KHCOLO" },
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: routes.service("cloud-call-center"), label: "3CX Phone System", body: "3CX configuration for calls, chat, video and queues" },
  { href: routes.service("3cx-bitrix24-integration"), label: "Bitrix24 CRM", body: "CRM, tasks and contact-center workflows, connected to 3CX" },
  { href: routes.contact, label: "Contact", body: "Telegram, phone, email or the inquiry form" },
];

export default function NotFound() {
  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-white">
      <div
        aria-hidden
        className="bg-cells absolute inset-y-0 right-0 hidden w-[55%] bg-[position:right_-1px_top_-1px] [mask-image:linear-gradient(to_left,black_30%,transparent_95%)] md:block"
      />
      <PixelBlock pattern="b" className="absolute top-0 right-[92px] hidden h-[92px] w-[69px] md:flex" />
      <div className="container-site relative pt-20 pb-24 lg:pt-28">
        <p className="text-eyebrow text-muted">
          <span className="text-brand-700">404</span> / Not found
        </p>
        <h1 className="text-display-sm mt-6 max-w-[16ch] text-ink-950">
          This page isn&rsquo;t here.
          <span aria-hidden className="caret ml-[0.12em] inline-block h-[0.78em] w-[0.36em] translate-y-[0.08em] bg-gradient-to-b from-brand-500 to-brand-200" />
        </h1>
        <p className="text-lede mt-6 max-w-xl text-muted">
          The link may be old or the page may have moved during our redesign. These are good places to continue:
        </p>
        <ul className="mt-12 grid max-w-4xl border-t border-l border-line md:grid-cols-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group flex h-full flex-col border-r border-b border-line bg-white p-6 transition-colors hover:bg-paper-2"
              >
                <span className="flex items-center justify-between text-[1.1rem] text-ink-950">
                  {l.label}
                  <ArrowRight aria-hidden className="arrow-nudge size-4 text-brand-700" />
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted">{l.body}</span>
              </Link>
            </li>
          ))}
        </ul>
        <ButtonLink href="/" className="mt-10" icon="arrow">
          Back to the homepage
        </ButtonLink>
      </div>
    </section>
  );
}
