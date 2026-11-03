import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { PixelBlock } from "./Pixels";

/** Light hero used by every inner page: hairline cell grid to the right, blue pixel blocks on its edge. */
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
    <section className="relative overflow-hidden border-b border-line bg-white">
      <div
        aria-hidden
        className="bg-cells absolute inset-y-0 right-0 hidden w-[62%] bg-[position:right_-1px_top_-1px] [mask-image:linear-gradient(to_left,black_35%,transparent_95%)] md:block"
      />
      <PixelBlock
        pattern="a"
        className="absolute top-0 right-0 hidden size-[92px] md:flex"
      />
      <PixelBlock
        pattern="c"
        className="absolute right-[276px] bottom-0 hidden h-[46px] w-[92px] lg:flex"
      />
      <div className={`container-site relative pt-8 lg:pt-12 ${compact ? "pb-14 lg:pb-16" : "pb-16 lg:pb-24"}`}>
        <Breadcrumbs items={crumbs} />
        <div className={`grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10 ${compact ? "mt-10" : "mt-12 lg:mt-16"}`}>
          <div className={aside ? "lg:col-span-7" : "lg:col-span-9"}>
            {eyebrow && (
              <div className="enter" style={{ ["--d" as string]: 0 }}>
                {eyebrow}
              </div>
            )}
            <h1 className={`${compact ? "text-headline" : "text-display-sm"} mt-6 max-w-[20ch] text-ink-950`}>{title}</h1>
            {/* No entrance animation on the lede: it is often the LCP element. */}
            {lede && <div className="text-lede mt-7 max-w-2xl text-muted">{lede}</div>}
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
