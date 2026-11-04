import type { Metadata } from "next";

import { absoluteUrl, routes, SITE_URL } from "./site";
import type { Category, Company, Product, Service } from "./types";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

type ShareImage = { url: string; width: number; height: number; alt: string };
type MetaInput = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  image?: ShareImage;
  keywords?: string[];
};

/** Search phrases for the pages built around KHCOLO's core platforms. */
export const CORE_KEYWORDS = [
  "3CX Cambodia",
  "3CX phone system configuration",
  "Bitrix24 Cambodia",
  "Bitrix24 CRM Cambodia",
  "3CX Bitrix24 integration",
  "3CX Phnom Penh",
  "Bitrix24 Phnom Penh",
];

/** Platform brands behind each service, used in Service structured data. */
const SERVICE_BRANDS: Record<string, string[]> = {
  "cloud-call-center": ["3CX"],
  "3cx-bitrix24-integration": ["Bitrix24", "3CX"],
  "voice-communication": ["Yealink"],
  "eset-antivirus": ["ESET"],
  "proxmoxve": ["Proxmox"],
};

export const DEFAULT_SHARE_IMAGE: ShareImage = {
  url: "/og/khcolo-share.png",
  width: 1200,
  height: 630,
  alt: "KHCOLO: 3CX phone system configuration and Bitrix24 CRM workflows",
};

/** One place that sets title, description, canonical and share metadata for a route. */
export function pageMetadata({ title, description, path, noindex, image = DEFAULT_SHARE_IMAGE, keywords }: MetaInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title: { absolute: title },
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "KHCOLO", locale: "en_US", type: "website", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
  };
}

// ---------------------------------------------------------------------------
// JSON-LD. Only visible, verified facts: no address, prices, offers or ratings.
// ---------------------------------------------------------------------------

export function organizationLd(company: Company) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: company.brand,
    url: `${SITE_URL}/`,
    logo: absoluteUrl("/brand/khcolo-logo.png"),
    description: company.description,
    email: company.email,
    telephone: company.phones[0]?.tel,
    areaServed: company.serviceAreas.map((a) => ({ "@type": "City", name: a.name })),
    ...(company.knowsAbout?.length ? { knowsAbout: company.knowsAbout } : {}),
    knowsLanguage: company.languages.map((l) => l.code),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: company.phones[0]?.tel,
        availableLanguage: company.languages.map((l) => l.name),
      },
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: company.email,
        telephone: company.phones[1]?.tel,
        availableLanguage: company.languages.map((l) => l.name),
      },
    ],
    sameAs: company.socials.map((s) => s.url),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: "KHCOLO",
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceLd(service: Service, groupName: string, areas: string[] = ["Phnom Penh", "Siem Reap"]) {
  const url = absoluteUrl(routes.service(service.slug));
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: service.name,
    serviceType: service.shortName,
    category: groupName,
    description: service.seo.description,
    url,
    provider: { "@id": ORG_ID },
    areaServed: areas.map((name) => ({ "@type": "City", name })),
    ...(SERVICE_BRANDS[service.slug]
      ? { brand: SERVICE_BRANDS[service.slug].map((name) => ({ "@type": "Brand", name })) }
      : {}),
  };
}

export function productLd(product: Product, category: Category) {
  const url = absoluteUrl(routes.product(product.slug));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    model: product.model,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    category: category.name,
    description: product.summary,
    url,
    ...(product.image ? { image: absoluteUrl(product.image.src) } : {}),
    additionalProperty: product.specs
      .filter((s) => !/confirmed with your quote/i.test(s.value))
      .map((s) => ({ "@type": "PropertyValue", name: s.label, value: s.value })),
  };
}

export function collectionLd(opts: { name: string; description: string; path: string; products: Product[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opts.products.length,
      itemListElement: opts.products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(routes.product(p.slug)),
        name: p.name,
      })),
    },
  };
}

export function webPageLd(type: "AboutPage" | "ContactPage" | "WebPage", opts: { name: string; path: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name: opts.name,
    url: absoluteUrl(opts.path),
    description: opts.description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
  };
}
