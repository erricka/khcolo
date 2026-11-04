import { NextResponse, type NextRequest } from "next/server";

/**
 * URL hygiene that has to happen before routing:
 *  - collapse accidental double slashes (the old site linked to //3cx-bitrix24-integration/)
 *  - answer deliberately removed URLs with 410 Gone
 *  - optionally enforce the canonical host and HTTPS (set in production)
 * Trailing slashes are handled by `trailingSlash: true` in next.config.ts.
 */

const GONE = new Set<string>(JSON.parse(process.env.KH_GONE_PATHS ?? "[]"));
const CANONICAL_HOST = process.env.CANONICAL_HOST;
const ENFORCE_HTTPS = process.env.ENFORCE_HTTPS === "true";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  let changed = false;

  if (url.pathname.includes("//")) {
    url.pathname = url.pathname.replace(/\/{2,}/g, "/");
    changed = true;
  }

  const host = request.headers.get("host") ?? "";
  if (CANONICAL_HOST && host && host !== CANONICAL_HOST) {
    url.host = CANONICAL_HOST;
    url.port = "";
    changed = true;
  }

  if (ENFORCE_HTTPS && request.headers.get("x-forwarded-proto") === "http") {
    url.protocol = "https:";
    url.port = "";
    changed = true;
  }

  if (changed) return NextResponse.redirect(url, 308);

  const withSlash = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  if (GONE.has(withSlash)) {
    return new NextResponse("This page has been removed.", {
      status: 410,
      headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" },
    });
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets and image optimisation.
  matcher: ["/((?!_next/static|_next/image|images/|brand/|og/|favicon.ico|icon.png|apple-icon.png).*)"],
};
