import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export type Crumb = { name: string; path: string };

/** Visible breadcrumb trail plus matching BreadcrumbList markup. */
export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className={`enter text-eyebrow text-muted ${className}`}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="text-ink-900">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.path} className="link-underline transition-colors hover:text-ink-950">
                      {item.name}
                    </Link>
                    <span aria-hidden className="text-ink-300">
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(items)} />
    </>
  );
}
