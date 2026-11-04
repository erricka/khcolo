import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import { apiBaseUrl, apiHeaders } from "./api-url";
import type { Category, Company, PageMeta, Product, Service } from "./types";

/**
 * Content access for server components.
 *
 * Production reads from the FastAPI service (KHCOLO_API_URL), which owns the
 * PostgreSQL data. Without an API URL, pages are built from the same JSON files
 * the database is seeded from, which keeps local design work and CI builds simple.
 */

const API_URL = apiBaseUrl();
// Read at runtime only; excluded from build tracing so the bundle stays small.
const CONTENT_DIR = process.env.KHCOLO_CONTENT_DIR ?? path.resolve(/*turbopackIgnore: true*/ process.cwd(), "..", "content");
export const REVALIDATE_SECONDS = 3600;

/**
 * Publication scope (content/publication.json). While the editorial lock is on, company,
 * page and service copy always comes from the reviewed JSON files, even when an API URL is
 * set, because existing database rows have not been reconciled with the approved copy.
 * Only the listed services are public; products and categories are archived, not shown.
 */
type Publication = { editorialLock: boolean; publicServices: string[]; productsPublic: boolean };
const getPublication = cache(async (): Promise<Publication> => {
  return JSON.parse(await readFile(path.join(CONTENT_DIR, "publication.json"), "utf8")) as Publication;
});
async function readFromApi(kind: "copy" | "catalog"): Promise<boolean> {
  if (!API_URL) return false;
  return kind === "catalog" || !(await getPublication()).editorialLock;
}

async function api<T>(endpoint: string): Promise<T | null> {
  const res = await fetch(`${API_URL}/api/v1${endpoint}`, {
    headers: apiHeaders(),
    next: { revalidate: REVALIDATE_SECONDS, tags: ["content"] },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Content API ${endpoint} responded ${res.status}`);
  return (await res.json()) as T;
}

const readJson = cache(async <T,>(file: string): Promise<T> => {
  return JSON.parse(await readFile(path.join(CONTENT_DIR, file), "utf8")) as T;
});

// The JSON files include private review fields. Strip them so the file-based
// path returns exactly what the public API would.
type WithReview = { review?: unknown; sourceUrl?: unknown; sourceUrls?: unknown };
function stripPrivate<T extends WithReview>(row: T) {
  const { review: _r, sourceUrl: _s, sourceUrls: _u, ...rest } = row;
  return rest;
}

export const getCompany = cache(async (): Promise<Company> => {
  if (await readFromApi("copy")) return (await api<Company>("/site"))!;
  return stripPrivate(await readJson<Company & WithReview>("company.json")) as Company;
});

/** Apply the same defaults the API's Pydantic models do, so both sources match. */
function normalizeService(s: Service): Service {
  return {
    ...s,
    highlights: s.highlights ?? [],
    capabilities: s.capabilities ?? [],
    capabilitiesNote: s.capabilitiesNote ?? "",
    process: s.process ?? [],
    faqs: s.faqs ?? [],
    related: s.related ?? [],
    relatedCategories: s.relatedCategories ?? [],
    options: (s.options ?? []).map((o) => ({
      ...o,
      intro: o.intro ?? null,
      note: o.note ?? null,
      columns: o.columns ?? [],
      rows: o.rows ?? [],
      tags: o.tags ?? [],
      cards: (o.cards ?? []).map((c) => ({ ...c, meta: c.meta ?? null, body: c.body ?? null, items: c.items ?? [] })),
    })),
  };
}

export const getServices = cache(async (): Promise<Service[]> => {
  const { publicServices } = await getPublication();
  const all = (await readFromApi("copy"))
    ? ((await api<Service[]>("/services")) ?? [])
    : (await readJson<(Service & WithReview)[]>("services.json")).map((s) => normalizeService(stripPrivate(s) as Service));
  return all
    .filter((s) => publicServices.includes(s.slug))
    .map((s) => ({ ...s, related: s.related.filter((r) => publicServices.includes(r)) }))
    .sort((a, b) => a.position - b.position);
});

/** Hidden services resolve to null so their routes answer 404 (the proxy answers 410 first). */
export const getService = cache(async (slug: string): Promise<Service | null> => {
  return (await getServices()).find((s) => s.slug === slug) ?? null;
});

export const getProducts = cache(async (): Promise<Product[]> => {
  if (!(await getPublication()).productsPublic) return [];
  if (await readFromApi("catalog")) return (await api<Product[]>("/products")) ?? [];
  const rows = await readJson<(Product & WithReview & { image: Product["image"] & { sourceUrl?: string } })[]>(
    "products.json",
  );
  const order = new Map((await getCategories()).map((c) => [c.slug, c.position]));
  return rows
    .map((p) => {
      const clean = stripPrivate(p) as Product;
      if (p.image) clean.image = { src: p.image.src, alt: p.image.alt, width: p.image.width, height: p.image.height };
      return clean;
    })
    .sort((a, b) => (order.get(a.category)! - order.get(b.category)!) || a.position - b.position);
});

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  if (!(await getPublication()).productsPublic) return null;
  if (await readFromApi("catalog")) return api<Product>(`/products/${encodeURIComponent(slug)}`);
  return (await getProducts()).find((p) => p.slug === slug) ?? null;
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!(await getPublication()).productsPublic) return [];
  if (await readFromApi("catalog")) return (await api<Category[]>("/categories")) ?? [];
  const [cats, products] = await Promise.all([
    readJson<(Omit<Category, "productCount"> & WithReview)[]>("categories.json"),
    readJson<{ category: string }[]>("products.json"),
  ]);
  return cats
    .map((c) => ({ ...(stripPrivate(c) as Omit<Category, "productCount">), productCount: products.filter((p) => p.category === c.slug).length }))
    .sort((a, b) => a.position - b.position);
});

export const getCategory = cache(async (slug: string): Promise<Category | null> => {
  if (!(await getPublication()).productsPublic) return null;
  if (await readFromApi("catalog")) return api<Category>(`/categories/${encodeURIComponent(slug)}`);
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
});

export const getPages = cache(async (): Promise<PageMeta[]> => {
  if (await readFromApi("copy")) return (await api<PageMeta[]>("/pages")) ?? [];
  const rows = await readJson<(PageMeta & WithReview)[]>("pages.json");
  return rows.map((p) => stripPrivate(p) as PageMeta);
});

export async function getPage(pathname: string): Promise<PageMeta> {
  const page = (await getPages()).find((p) => p.path === pathname);
  if (!page) throw new Error(`No page metadata for ${pathname}`);
  return page;
}
