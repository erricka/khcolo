import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

type RedirectRow = { source: string; destination: string | null; statusCode: number };

const contentDir = process.env.KHCOLO_CONTENT_DIR ?? path.resolve(process.cwd(), "..", "content");
const readContent = <T,>(file: string): T => JSON.parse(readFileSync(path.join(contentDir, file), "utf8")) as T;

type Publication = {
  editorialLock: boolean;
  publicServices: string[];
  productsPublic: boolean;
  gonePaths: string[];
  gonePrefixes: string[];
};
const publication = readContent<Publication>("publication.json");

/**
 * Everything that is not public answers 410 Gone: hidden services, and (while products are
 * archived) every product and category URL, plus legacy URLs listed in publication.json.
 */
function hiddenPaths(): string[] {
  const services = readContent<{ slug: string }[]>("services.json")
    .filter((s) => !publication.publicServices.includes(s.slug))
    .map((s) => `/${s.slug}/`);
  const catalog = publication.productsPublic
    ? []
    : [
        ...readContent<{ slug: string }[]>("categories.json").map((c) => `/product-category/${c.slug}/`),
        ...readContent<{ slug: string }[]>("products.json").map((p) => `/product/${p.slug}/`),
      ];
  return [...services, ...catalog, ...publication.gonePaths];
}

/** Redirect map from the API when available (and not locked), otherwise from content/redirects.json. */
async function loadRedirectRows(): Promise<RedirectRow[]> {
  const raw = process.env.KHCOLO_API_URL?.trim();
  const api = raw && !publication.editorialLock ? (raw.includes("://") ? raw : `http://${raw}`).replace(/\/$/, "") : undefined;
  if (api) {
    const key = process.env.INTERNAL_API_KEY;
    const res = await fetch(`${api}/api/v1/redirects`, { headers: key ? { "x-internal-key": key } : {} });
    if (!res.ok) throw new Error(`Could not load redirects from ${api} (HTTP ${res.status})`);
    return res.json();
  }
  const file = JSON.parse(readFileSync(path.join(contentDir, "redirects.json"), "utf8")) as {
    redirects: { source: string; destination: string; permanent?: boolean }[];
    gone: { path: string }[];
  };
  return [
    ...file.redirects.map((r) => ({
      source: r.source,
      destination: r.destination,
      statusCode: r.permanent === false ? 307 : 308,
    })),
    ...file.gone.map((g) => ({ source: g.path, destination: null, statusCode: 410 })),
  ];
}

const isProduction = process.env.SITE_ENV === "production";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  ...(process.env.ENFORCE_HTTPS === "true"
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
    : []),
  // Staging and preview deployments must never be indexed.
  ...(isProduction ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
];

export default async function config(): Promise<NextConfig> {
  const rows = await loadRedirectRows();
  const hidden = new Set(hiddenPaths());
  // A redirect into hidden content would leak it, so those old URLs are gone instead.
  const moved = rows.filter(
    (r) => r.destination && r.statusCode !== 410 && !hidden.has(r.source) && !hidden.has(r.destination),
  );
  const gone = [
    ...new Set([
      ...rows.filter((r) => r.statusCode === 410 || (r.destination && hidden.has(r.destination))).map((r) => r.source),
      ...hidden,
    ]),
  ];

  return {
    output: "standalone",
    trailingSlash: true,
    poweredByHeader: false,
    reactStrictMode: true,
    env: {
      // Read by src/proxy.ts to answer removed URLs with 410 Gone.
      KH_GONE_PATHS: JSON.stringify(gone),
      KH_GONE_PREFIXES: JSON.stringify(publication.gonePrefixes),
    },
    images: {
      formats: ["image/avif", "image/webp"],
      qualities: [75],
      // Archived product photos must not be served through the optimiser either.
      localPatterns: publication.productsPublic ? undefined : [{ pathname: "/brand/**" }, { pathname: "/og/**" }],
    },
    async redirects() {
      return moved.map((r) => ({
        source: r.source,
        destination: r.destination as string,
        statusCode: r.statusCode as 301 | 302 | 303 | 307 | 308,
      }));
    },
    async headers() {
      return [
        { source: "/:path*", headers: securityHeaders },
        {
          source: "/images/:path*",
          headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
        },
      ];
    },
  };
}
