import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { routes } from "@/lib/site";
import type { Service } from "@/lib/types";

/**
 * The two platforms KHCOLO is best known for, side by side and shown as connected.
 * Copy comes from the service records so it stays in step with their pages.
 */
export function CorePlatforms({ threecx, bitrix }: { threecx: Service; bitrix: Service }) {
  const platforms = [
    { service: threecx, mark: "3CX", label: "Phone system & call center" },
    { service: bitrix, mark: "Bitrix24", label: "CRM & collaboration" },
  ];

  return (
    <section aria-labelledby="platforms-title" className="pt-24 lg:pt-32">
      <div className="container-site">
        <div className="grid overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-[var(--shadow-card)] lg:grid-cols-12">
          <div className="border-b border-line p-7 sm:p-12 lg:col-span-5 lg:border-r lg:border-b-0 lg:p-14" data-reveal="blur">
            <Eyebrow>Core platforms</Eyebrow>
            <h2 id="platforms-title" className="text-title mt-5 text-ink-950">
              3CX and Bitrix24, set up and supported in Cambodia.
            </h2>
            <p className="text-lede mt-6 text-muted">
              A 3CX phone system for every call, chat and message, and Bitrix24 CRM for the customer behind it, connected
              to each other and looked after by one local team.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href={routes.consult(bitrix.slug)}>Plan my 3CX + Bitrix24 setup</ButtonLink>
            </div>
            <p className="mt-6 text-sm text-muted">
              <span className="font-semibold text-ink-900">3CX Gold Partner</span> · local implementation, training and
              support in Khmer or English.
            </p>
          </div>

          <div className="relative p-4 sm:p-6 lg:col-span-7 lg:p-8">
            <ol className="relative grid gap-4">
              {platforms.map(({ service, mark, label }, i) => (
                <li key={service.slug} data-reveal style={{ ["--i" as string]: i + 1 }}>
                  <Link
                    href={routes.service(service.slug)}
                    data-spotlight
                    className="group relative flex flex-col gap-6 rounded-2xl border border-line bg-paper/50 p-6 transition-[translate,box-shadow,border-color,background-color] duration-200 hover:-translate-y-[3px] hover:border-brand-600/30 hover:bg-white hover:shadow-[var(--shadow-lift)] sm:flex-row sm:p-7"
                  >
                    <span className="flex h-16 w-full shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-bold tracking-[-0.03em] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] sm:size-24 sm:text-[1.35rem]">
                      {mark}
                    </span>
                    <span className="flex-1">
                      <span className="text-eyebrow block text-brand-700">{label}</span>
                      <span className="mt-2 block text-xl font-semibold tracking-tight text-ink-950">{service.shortName}</span>
                      <span className="mt-1.5 block leading-relaxed text-muted">{service.summary}</span>
                      <span className="mt-4 grid gap-2 text-[0.94rem] text-ink-900 sm:grid-cols-2">
                        {service.highlights.slice(0, 4).map((h) => (
                          <span key={h} className="flex gap-2">
                            <Check aria-hidden className="mt-1 size-3.5 shrink-0 text-accent-600" strokeWidth={2.5} />
                            {h}
                          </span>
                        ))}
                      </span>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                        Explore {mark}
                        <ArrowRight aria-hidden className="arrow-nudge size-4" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            {/* Connector between the two platforms */}
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-accent-500/30 bg-white px-3 py-1.5 text-xs font-semibold text-accent-700 shadow-[var(--shadow-card)] sm:inline-flex"
            >
              <span className="size-1.5 rounded-full bg-accent-500" />
              Connected
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
