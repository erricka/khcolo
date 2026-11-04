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
      className={`group relative flex h-full flex-row items-start gap-4 border border-line bg-white p-5 transition-[border-color,background-color] duration-200 ease-[var(--ease-out-quart)] hover:border-ink-950 sm:flex-col sm:gap-0 sm:p-7 ${
        wide ? "col-span-full md:flex-row md:items-start md:gap-10" : ""
      }`}
    >
      <span className="flex size-10 shrink-0 items-center justify-center bg-brand-50 text-brand-700 transition-colors duration-200 group-hover:bg-brand-600 group-hover:text-white">
        <ServiceIcon name={service.icon} className="size-5" />
      </span>
      <div className={`flex flex-1 flex-col self-stretch ${wide ? "sm:mt-6 md:mt-0" : "sm:mt-6"}`}>
        <h3 id={titleId} className="text-[1.2rem] leading-snug tracking-[-0.018em] text-ink-950">
          {service.shortName}
        </h3>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{service.summary}</p>
        {wide && (
          <ul className="mt-5 hidden gap-x-8 gap-y-2 text-sm text-body sm:grid sm:grid-cols-2">
            {service.highlights.map((h) => (
              <li key={h} className="flex gap-2.5">
                <span aria-hidden className="mt-[0.55em] size-1.5 shrink-0 bg-brand-600" />
                {h}
              </li>
            ))}
          </ul>
        )}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm text-brand-700 sm:pt-6">
          Learn more
          <ArrowRight aria-hidden className="arrow-nudge size-4" />
        </span>
      </div>
    </Link>
  );
}
