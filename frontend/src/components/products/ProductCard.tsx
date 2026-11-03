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
      className="group relative flex h-full flex-col overflow-hidden border border-line bg-white transition-[border-color] duration-200 ease-[var(--ease-out-quart)] focus-within:border-ink-950 hover:border-ink-950"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-paper-2">
        {product.image && (
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="photo-multiply object-contain p-5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.035]"
          />
        )}
        <span className="text-eyebrow absolute top-0 left-0 border-r border-b border-line bg-white px-2.5 py-1.5 text-[0.66rem] text-ink-600">
          {product.facet}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-5 pt-5 pb-5">
        <p className="text-eyebrow text-brand-700">{brandLabel(product)}</p>
        <Heading className="mt-2.5 text-[1.1rem] leading-snug tracking-[-0.015em] text-ink-950">
          <Link href={routes.product(product.slug)} className="after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </Heading>
        <p className="mt-1 text-sm text-muted">{product.type}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Key specifications">
          {product.keySpecs.map((s) => (
            <li key={s} className="border border-line bg-paper-2 px-2 py-1 font-mono text-[0.7rem] text-ink-700">
              {s}
            </li>
          ))}
        </ul>
        <span aria-hidden className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm text-brand-700">
          View details
          <ArrowRight className="arrow-nudge size-4" />
        </span>
      </div>
    </article>
  );
}
