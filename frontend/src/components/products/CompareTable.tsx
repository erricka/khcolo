import Link from "next/link";

import { COMPARE_COLUMNS } from "@/lib/compare";
import { routes } from "@/lib/site";
import type { Product } from "@/lib/types";

export function CompareTable({ category, products }: { category: string; products: Product[] }) {
  const columns = COMPARE_COLUMNS[category];
  if (!columns) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white px-5 shadow-[var(--shadow-card)] md:px-0" data-reveal>
      <table className="table-stack w-full text-left text-[0.93rem]">
        <caption className="sr-only">Comparison of listed specifications</caption>
        <thead>
          <tr className="border-b border-line bg-paper/60">
            <th scope="col" className="text-eyebrow px-6 py-4 font-medium text-muted">
              Model
            </th>
            {columns.map((c) => (
              <th key={c.label} scope="col" className="text-eyebrow px-6 py-4 font-medium text-muted">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="md:divide-y md:divide-line">
          {products.map((p) => (
            <tr key={p.slug} className="align-top transition-colors md:hover:bg-paper/50">
              <th scope="row" data-label="Model" className="px-6 py-4 font-semibold whitespace-nowrap text-ink-950">
                <Link href={routes.product(p.slug)} className="link-underline hover:text-brand-700">
                  {p.model}
                </Link>
              </th>
              {columns.map((c) => (
                <td
                  key={c.label}
                  data-label={c.label}
                  className={`px-6 py-4 ${c.mono ? "font-mono text-[0.85rem] text-ink-900" : "text-muted"}`}
                >
                  {c.value(p) ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
