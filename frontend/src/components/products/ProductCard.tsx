import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { brandLabel, routes } from "@/lib/site";
import type { Product } from "@/lib/types";

export function ProductCard({ product, headingLevel = "h3" }: { product: Product; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article
      data-spotlight
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-card)] transition-[translate,box-shadow,border-color] duration-200 ease-[var(--ease-out-quart)] focus-within:-translate-y-[3px] hover:-translate-y-[3px] hover:border-brand-600/35 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative m-2 aspect-[4/3] overflow-hidden rounded-xl bg-paper">
        {product.image && (
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="photo-multiply object-contain p-5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.035]"
          />
        )}
        <span className="absolute top-3 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[0.66rem] font-semibold tracking-[0.08em] text-ink-600 uppercase backdrop-blur">
          {product.facet}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-5 pt-3 pb-5">
        <p className="text-eyebrow text-brand-700">{brandLabel(product)}</p>
        <Heading className="mt-2.5 text-[1.08rem] leading-snug font-semibold tracking-[-0.015em] text-ink-950">
          <Link href={routes.product(product.slug)} className="after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </Heading>
        <p className="mt-1 text-sm text-muted">{product.type}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Key specifications">
          {product.keySpecs.map((s) => (
            <li key={s} className="rounded-md border border-line bg-paper/60 px-2 py-1 font-mono text-[0.7rem] text-ink-700">
              {s}
            </li>
          ))}
        </ul>
        <span aria-hidden className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-brand-700">
          View details
          <ArrowRight className="arrow-nudge size-4" />
        </span>
      </div>
    </article>
  );
}
