export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://khcolo.com").replace(/\/$/, "");

/** Absolute URL for a site path. Paths always carry a trailing slash on this site. */
export function absoluteUrl(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

export const routes = {
  home: "/",
  about: "/about-us/",
  contact: "/contact-us/",
  privacy: "/privacy-policy/",
  products: "/products/",
  service: (slug: string) => `/${slug}/`,
  category: (slug: string) => `/product-category/${slug}/`,
  product: (slug: string) => `/product/${slug}/`,
  quote: (productSlug: string) => `/contact-us/?type=quote&product=${encodeURIComponent(productSlug)}#inquiry`,
  consult: (serviceSlug: string) => `/contact-us/?type=consultation&interest=${encodeURIComponent(serviceSlug)}#inquiry`,
};

/** Display brand for products whose manufacturer is not confirmed. */
export function brandLabel(p: { brand: string | null; series?: string | null }): string {
  return p.brand ?? (p.series ? `${p.series} series` : "Other");
}

/** Representative product photo for each category tile and menu entry. */
export const CATEGORY_HERO_PRODUCT: Record<string, string> = {
  "ip-phone": "yealink-sip-t46u-ip-phone",
  "voip-gateway": "yeastar-neogate-tg800-gsm-gateway",
  "ip-pbx": "p-series-pbx-p560",
};
