import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { routes } from "@/lib/site";
import type { Category, Product } from "@/lib/types";

/** Large category tile with a representative photo and sample models. */
export function CategoryCard({
  category,
  hero,
  sample,
  brands,
  index = 0,
  tone = "light",
}: {
  category: Category;
  hero: Product | undefined;
  sample: Product[];
  brands: string[];
  index?: number;
  tone?: "dark" | "light";
}) {
  const dark = tone === "dark";
  return (
    <Link
      href={routes.category(category.slug)}
      data-reveal
      data-spotlight={dark ? "dark" : ""}
      style={{ ["--i" as string]: index }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-2 transition-[translate,box-shadow,border-color,background-color] duration-200 ease-[var(--ease-out-quart)] hover:-translate-y-1 focus-visible:-translate-y-1 ${
        dark
          ? "border-white/[0.08] bg-ink-850 hover:border-brand-300/30 hover:bg-ink-800 hover:shadow-[0_24px_48px_-24px_rgb(0_0_0/0.6)]"
          : "border-line bg-white shadow-[var(--shadow-card)] hover:border-brand-600/35 hover:shadow-[var(--shadow-lift)]"
      }`}
    >
      <div className="bg-blueprint-light relative aspect-[16/10] overflow-hidden rounded-xl bg-paper">
        {hero?.image && (
          <Image
            src={hero.image.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 400px, 100vw"
            className="photo-multiply object-contain p-3 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
        )}
        <span className="absolute right-3 bottom-3 rounded-full bg-ink-950/85 px-3 py-1 text-[0.72rem] font-medium text-white tabular-nums">
          {category.productCount} models
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 pt-5 sm:p-5">
        <p className={`text-eyebrow ${dark ? "text-brand-300/80" : "text-brand-700"}`}>{brands.join(" · ")}</p>
        <h3 className={`mt-3 text-xl font-semibold tracking-tight ${dark ? "text-white" : "text-ink-950"}`}>{category.name}</h3>
        <p className={`mt-2 leading-relaxed ${dark ? "text-ink-300" : "text-muted"}`}>{category.summary}</p>
        <p className={`mt-4 font-mono text-[0.75rem] leading-relaxed ${dark ? "text-ink-400" : "text-ink-500"}`}>
          {sample.map((p) => p.model).join("  ·  ")}
        </p>
        <span
          className={`mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium ${dark ? "text-brand-300" : "text-brand-700"}`}
        >
          View all {category.productCount} models
          <ArrowRight aria-hidden className="arrow-nudge size-4" />
        </span>
      </div>
    </Link>
  );
}
