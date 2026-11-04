import { CATEGORY_HERO_PRODUCT } from "@/lib/site";
import type { Category, Company, Product, Service } from "@/lib/types";

export type NavService = { slug: string; name: string; summary: string; icon: string };
export type NavGroup = { key: string; name: string; summary: string; services: NavService[] };
export type NavCategory = {
  slug: string;
  name: string;
  summary: string;
  count: number;
  image: { src: string; alt: string } | null;
};
export type NavData = {
  groups: NavGroup[];
  categories: NavCategory[];
  phone: { display: string; tel: string };
  telegram: string;
};

export function buildNavData(company: Company, services: Service[], categories: Category[], products: Product[]): NavData {
  return {
    // Only groups with at least one public service appear in navigation.
    groups: company.solutionGroups
      .map((g) => ({
        key: g.key,
        name: g.name,
        summary: g.summary,
        services: services
          .filter((s) => s.group === g.key)
          .map((s) => ({ slug: s.slug, name: s.shortName, summary: s.summary, icon: s.icon })),
      }))
      .filter((g) => g.services.length > 0),
    categories: categories.map((c) => {
      const hero = products.find((p) => p.slug === CATEGORY_HERO_PRODUCT[c.slug]) ?? products.find((p) => p.category === c.slug);
      return {
        slug: c.slug,
        name: c.name,
        summary: c.summary,
        count: c.productCount,
        image: hero?.image ? { src: hero.image.src, alt: hero.image.alt } : null,
      };
    }),
    phone: company.phones[0],
    telegram: company.telegram.url,
  };
}
