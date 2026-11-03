import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

type RedirectRow = { source: string; destination: string | null; statusCode: number };

const contentDir = process.env.KHCOLO_CONTENT_DIR ?? path.resolve(process.cwd(), "..", "content");

/** Redirect map from the API when available, otherwise from content/redirects.json. */
async function loadRedirectRows(): Promise<RedirectRow[]> {
  const raw = process.env.KHCOLO_API_URL?.trim();
  const api = raw ? (raw.includes("://") ? raw : `http://${raw}`).replace(/\/$/, "") : undefined;
  if (api) {
    const res = await fetch(`${api}/api/v1/redirects`);
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
  const moved = rows.filter((r) => r.destination && r.statusCode !== 410);
  const gone = rows.filter((r) => r.statusCode === 410).map((r) => r.source);

  return {
    output: "standalone",
    trailingSlash: true,
    poweredByHeader: false,
    reactStrictMode: true,
    env: {
      // Read by src/proxy.ts to answer removed URLs with 410 Gone.
      KH_GONE_PATHS: JSON.stringify(gone),
    },
    images: {
      formats: ["image/avif", "image/webp"],
      qualities: [75],
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
