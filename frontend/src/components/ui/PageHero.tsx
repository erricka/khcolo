import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

/** Dark hero used by every inner page so the fixed header always sits on navy. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  lede,
  actions,
  aside,
  children,
  compact = false,
}: {
  crumbs: Crumb[];
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="surface-dark bg-grain relative overflow-hidden bg-ink-950 text-white">
      <div
        aria-hidden
        className="bg-blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_85%_10%,black_10%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="absolute top-[-22rem] right-[-14rem] size-[48rem] rounded-full bg-[radial-gradient(closest-side,rgb(61_104_242/0.28),transparent)]"
      />
      <div
        className={`container-site relative pt-[calc(var(--header-h)+2.5rem)] ${compact ? "pb-14 lg:pb-16" : "pb-16 lg:pb-24"}`}
      >
        <Breadcrumbs items={crumbs} />
        <div className={`grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10 ${compact ? "mt-10" : "mt-12 lg:mt-16"}`}>
          <div className={aside ? "lg:col-span-7" : "lg:col-span-9"}>
            {eyebrow && (
              <div className="enter" style={{ ["--d" as string]: 0 }}>
                {eyebrow}
              </div>
            )}
            <h1 className={`${compact ? "text-headline" : "text-display-sm"} mt-6 max-w-[20ch] text-white`}>{title}</h1>
            {/* No entrance animation on the lede: it is often the LCP element. */}
            {lede && (
              <div className="text-lede mt-7 max-w-2xl text-ink-300">
                {lede}
              </div>
            )}
            {actions && (
              <div className="enter mt-9 flex flex-wrap gap-3" style={{ ["--d" as string]: 2 }}>
                {actions}
              </div>
            )}
          </div>
          {aside && (
            <div className="enter lg:col-span-5 lg:pt-2" style={{ ["--d" as string]: 2 }}>
              {aside}
            </div>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
