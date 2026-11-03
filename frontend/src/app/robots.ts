import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

/**
 * Crawl rules. robots.txt is not access control: the admin API is protected by
 * a token, and API responses also send X-Robots-Tag: noindex.
 */
export default function robots(): MetadataRoute.Robots {
  // Only an explicit production build may be crawled; see SITE_ENV in .env.example.
  const production = process.env.SITE_ENV === "production";
  return {
    rules: production
      ? [{ userAgent: "*", allow: "/", disallow: ["/api/"] }]
      : // Staging and preview builds stay out of search entirely.
        [{ userAgent: "*", disallow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
