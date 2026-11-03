/** Shapes returned by the FastAPI content endpoints (and mirrored by /content JSON). */

export type Seo = { title: string; description: string };

export type GroupKey = "communications" | "security" | "cloud" | "managed-it";

export type SolutionGroup = { key: GroupKey; name: string; summary: string; need: string };

export type Company = {
  brand: string;
  siteUrl: string;
  tagline: string;
  positioning: string;
  description: string;
  operatingSince: number;
  serviceAreas: { name: string; note: string }[];
  languages: { code: string; name: string; native: string }[];
  email: string;
  phones: { display: string; tel: string }[];
  telegram: { handle: string; url: string };
  socials: { name: string; url: string }[];
  partners: { vendor: string; relationship: string; scope: string }[];
  principles: { title: string; body: string }[];
  solutionGroups: SolutionGroup[];
  updatedAt: string;
};

export type OptionCard = { title: string; meta?: string | null; body?: string | null; items: string[] };

export type OptionBlock = {
  heading: string;
  intro?: string | null;
  layout: "cards" | "table" | "tags";
  cards: OptionCard[];
  columns: string[];
  rows: string[][];
  tags: string[];
  note?: string | null;
};

export type Service = {
  slug: string;
  group: GroupKey;
  position: number;
  name: string;
  shortName: string;
  icon: string;
  summary: string;
  h1: string;
  intro: string;
  seo: Seo;
  highlights: string[];
  overview: { heading: string; body: string[] };
  capabilities: { title: string; items: string[] }[];
  capabilitiesNote: string;
  options: OptionBlock[];
  process: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  related: string[];
  relatedCategories: string[];
  updatedAt: string;
};

export type Category = {
  slug: string;
  position: number;
  name: string;
  singular: string;
  h1: string;
  summary: string;
  intro: string;
  facetLabel: string;
  seo: Seo;
  relatedServices: string[];
  productCount: number;
  updatedAt: string;
};

export type ProductImage = { src: string; alt: string; width: number; height: number };

export type Product = {
  slug: string;
  category: string;
  position: number;
  brand: string | null;
  series?: string | null;
  model: string;
  name: string;
  variant?: string | null;
  type: string;
  facet: string;
  summary: string;
  keySpecs: string[];
  specs: { label: string; value: string }[];
  accessories: string[];
  publicNotes: string[];
  image: ProductImage | null;
  seo: Seo;
  updatedAt: string;
};

export type PageMeta = {
  path: string;
  title: string;
  description: string;
  h1: string;
  schemaType: string;
  indexable: boolean;
  updatedAt: string;
};
