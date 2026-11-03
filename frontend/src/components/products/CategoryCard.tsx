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
  void tone;
  return (
    <Link
      href={routes.category(category.slug)}
      data-reveal
      data-spotlight
      style={{ ["--i" as string]: index }}
      className="group relative flex h-full flex-col overflow-hidden border border-line bg-white transition-[border-color] duration-200 ease-[var(--ease-out-quart)] hover:border-ink-950"
    >
      <div className="bg-cells relative aspect-[16/10] overflow-hidden border-b border-line bg-paper-2 [--cell:46px]">
        {hero?.image && (
          <Image
            src={hero.image.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 400px, 100vw"
            className="photo-multiply object-contain p-5 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
        )}
        <span className="text-eyebrow absolute right-0 bottom-0 bg-ink-950 px-2.5 py-1.5 text-[0.68rem] text-white tabular-nums">
          {category.productCount} models
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-eyebrow text-brand-700">{brands.join(" · ")}</p>
        <h3 className="mt-3 text-[1.35rem] tracking-[-0.02em] text-ink-950">{category.name}</h3>
        <p className="mt-2 leading-relaxed text-muted">{category.summary}</p>
        <p className="mt-4 font-mono text-[0.74rem] leading-relaxed text-ink-500">{sample.map((p) => p.model).join("  ·  ")}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm text-brand-700">
          View all {category.productCount} models
          <ArrowRight aria-hidden className="arrow-nudge size-4" />
        </span>
      </div>
    </Link>
  );
}
