import type { MetadataRoute } from "next";

import { getCategories, getPages, getProducts, getServices } from "@/lib/content";
import { absoluteUrl, routes } from "@/lib/site";

export const revalidate = 3600;

/** Canonical, indexable URLs only, with the date their content last changed. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, services, categories, products] = await Promise.all([
    getPages(),
    getServices(),
    getCategories(),
    getProducts(),
  ]);

  return [
    ...pages.filter((p) => p.indexable).map((p) => ({ url: absoluteUrl(p.path), lastModified: p.updatedAt })),
    ...services.map((s) => ({ url: absoluteUrl(routes.service(s.slug)), lastModified: s.updatedAt })),
    ...categories.map((c) => ({ url: absoluteUrl(routes.category(c.slug)), lastModified: c.updatedAt })),
    ...products.map((p) => ({ url: absoluteUrl(routes.product(p.slug)), lastModified: p.updatedAt })),
  ];
}
