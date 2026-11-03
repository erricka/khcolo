"use client";

import { AnimatePresence, m } from "motion/react";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { brandLabel } from "@/lib/site";
import type { Product } from "@/lib/types";

import { ProductCard } from "./ProductCard";

type Filters = { q: string; facet: string; brand: string; category: string };
const EMPTY: Filters = { q: "", facet: "", brand: "", category: "" };

/**
 * Search and filter for a product list. Every product is rendered on the server,
 * so the full list stays crawlable; filters only narrow it in the browser and are
 * mirrored to the query string for sharing. Canonical URLs ignore the query.
 */
export function CatalogBrowser({
  products,
  facetLabel,
  categories,
}: {
  products: Product[];
  facetLabel?: string;
  categories?: { slug: string; name: string }[];
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY);

  // Pick up filters from a shared link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilters({
      q: params.get("q") ?? "",
      facet: params.get("type") ?? "",
      brand: params.get("brand") ?? "",
      category: params.get("category") ?? "",
    });
  }, []);

  function update(patch: Partial<Filters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.facet) params.set("type", next.facet);
    if (next.brand) params.set("brand", next.brand);
    if (next.category) params.set("category", next.category);
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
  }

  const scoped = filters.category ? products.filter((p) => p.category === filters.category) : products;
  const facets = useMemo(() => countBy(scoped, (p) => p.facet), [scoped]);
  const brands = useMemo(() => countBy(scoped, brandLabel), [scoped]);

  const results = useMemo(() => {
    const needle = filters.q.trim().toLowerCase();
    return scoped.filter((p) => {
      if (filters.facet && p.facet !== filters.facet) return false;
      if (filters.brand && brandLabel(p) !== filters.brand) return false;
      if (!needle) return true;
      const hay = `${p.name} ${p.model} ${p.type} ${p.keySpecs.join(" ")} ${p.specs.map((s) => s.value).join(" ")}`.toLowerCase();
      return needle.split(/\s+/).every((word) => hay.includes(word));
    });
  }, [scoped, filters]);

  const active = filters.q || filters.facet || filters.brand || filters.category;

  return (
    <div>
      <div className="border border-line bg-paper-2 p-4 sm:p-5" role="search">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative block lg:w-80">
            <span className="sr-only">Search products</span>
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={filters.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Search model or feature"
              className="h-11 w-full border border-line-strong bg-white pr-4 pl-11 text-[0.95rem] text-ink-950 transition-colors outline-none placeholder:text-ink-400 hover:border-ink-400 focus:border-brand-600 focus:bg-white focus:ring-4 focus:ring-brand-500/15"
            />
          </label>
          <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-3">
            {categories && categories.length > 1 && (
              <ChipGroup
                label="Category"
                value={filters.category}
                options={categories.map((c) => ({ value: c.slug, label: c.name, count: products.filter((p) => p.category === c.slug).length }))}
                onChange={(category) => update({ category, facet: "", brand: "" })}
              />
            )}
            {Object.keys(facets).length > 1 && (
              <ChipGroup
                label={facetLabel ?? "Type"}
                value={filters.facet}
                options={Object.entries(facets).map(([value, count]) => ({ value, label: value, count }))}
                onChange={(facet) => update({ facet })}
              />
            )}
            {Object.keys(brands).length > 1 && (
              <ChipGroup
                label="Brand"
                value={filters.brand}
                options={Object.entries(brands).map(([value, count]) => ({ value, label: value, count }))}
                onChange={(brand) => update({ brand })}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted tabular-nums" aria-live="polite">
          {results.length === products.length
            ? `${products.length} models`
            : `${results.length} of ${products.length} models`}
        </p>
        {active && (
          <button
            type="button"
            onClick={() => update(EMPTY)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-brand-700 transition-colors hover:bg-brand-50"
          >
            <X aria-hidden className="size-3.5" />
            Clear filters
          </button>
        )}
      </div>

      <m.ul layout className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence initial={false} mode="popLayout">
          {results.map((p) => (
            <m.li
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            >
              <ProductCard product={p} />
            </m.li>
          ))}
        </AnimatePresence>
      </m.ul>

      {results.length === 0 && (
        <div className="mt-4 border border-dashed border-line-strong p-12 text-center">
          <p className="text-lg font-medium text-ink-950">No models match those filters.</p>
          <p className="mt-2 text-muted">Try a different search, or ask us. We supply more than we list here.</p>
        </div>
      )}
    </div>
  );
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const k = key(item);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

function ChipGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; count: number }[];
  onChange: (value: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      <span aria-hidden className="text-eyebrow mr-1.5 text-muted">
        {label}
      </span>
      {[{ value: "", label: "All", count: 0 }, ...options].map((o) => {
        const pressed = value === o.value;
        return (
          <button
            key={o.value || "all"}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(o.value)}
            className={`inline-flex h-9 items-center gap-1.5 border px-3.5 text-sm transition-[background-color,border-color,color] duration-150 ${
              pressed
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-line-strong bg-white text-ink-800 hover:border-ink-950"
            }`}
          >
            {o.label}
            {o.value && <span className={`font-mono text-[0.7rem] tabular-nums ${pressed ? "text-brand-100" : "text-ink-500"}`}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
