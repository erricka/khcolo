import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { routes } from "@/lib/site";
import type { Service } from "@/lib/types";

export function ServiceCard({ service, index = 0, wide = false }: { service: Service; index?: number; wide?: boolean }) {
  const titleId = `svc-${service.slug}`;
  return (
    <Link
      href={routes.service(service.slug)}
      aria-labelledby={titleId}
      data-reveal
      data-spotlight
      style={{ ["--i" as string]: index }}
      className={`group relative flex h-full flex-row items-start gap-4 rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-card)] transition-[translate,box-shadow,border-color] duration-200 ease-[var(--ease-out-quart)] hover:-translate-y-[3px] hover:border-brand-600/35 hover:shadow-[var(--shadow-lift)] focus-visible:-translate-y-[3px] active:scale-[0.99] sm:flex-col sm:gap-0 sm:p-7 ${
        wide ? "sm:col-span-2 md:flex-row md:items-start md:gap-10" : ""
      }`}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-700/10 transition-colors duration-200 group-hover:bg-brand-100">
        <ServiceIcon name={service.icon} className="size-5" />
      </span>
      <div className={`flex flex-1 flex-col self-stretch ${wide ? "sm:mt-6 md:mt-0" : "sm:mt-6"}`}>
        <h3 id={titleId} className="text-[1.15rem] leading-snug font-semibold tracking-[-0.015em] text-ink-950">
          {service.shortName}
        </h3>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{service.summary}</p>
        {wide && (
          <ul className="mt-5 hidden gap-x-8 gap-y-2 text-sm text-body sm:grid sm:grid-cols-2">
            {service.highlights.map((h) => (
              <li key={h} className="flex gap-2.5">
                <span aria-hidden className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-brand-500" />
                {h}
              </li>
            ))}
          </ul>
        )}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-brand-700 sm:pt-6">
          Learn more
          <ArrowRight aria-hidden className="arrow-nudge size-4" />
        </span>
      </div>
    </Link>
  );
}
