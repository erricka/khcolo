import { NextResponse } from "next/server";

import { apiBaseUrl, apiHeaders } from "@/lib/api-url";

/**
 * Forwards the contact form to the FastAPI service. Keeping this hop on the
 * server means the API URL stays private and the API sees the visitor's IP
 * (via X-Forwarded-For) for rate limiting.
 */

const MAX_BYTES = 32 * 1024;

export async function POST(request: Request) {
  const api = apiBaseUrl();
  if (!api) {
    return NextResponse.json({ detail: "The inquiry service is not configured." }, { status: 503 });
  }

  const body = await request.text();
  if (body.length > MAX_BYTES) {
    return NextResponse.json({ detail: "Request body too large." }, { status: 413 });
  }

  // The platform proxy (Render, Caddy, nginx) appends the address it saw, so the
  // right-most entry is the one a visitor cannot forge.
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const clientIp = forwarded.split(",").map((part) => part.trim()).filter(Boolean).pop() ?? "";

  let upstream: Response;
  try {
    upstream = await fetch(`${api}/api/v1/inquiries`, {
      method: "POST",
      headers: apiHeaders({
        "content-type": "application/json",
        "x-forwarded-for": clientIp,
        "user-agent": request.headers.get("user-agent") ?? "",
      }),
      body,
      cache: "no-store",
      // Generous: an API on a sleeping free-tier instance can take ~a minute to wake.
      signal: AbortSignal.timeout(75_000),
    });
  } catch {
    return NextResponse.json({ detail: "The inquiry service is unavailable." }, { status: 502 });
  }

  const headers = new Headers({ "content-type": "application/json", "cache-control": "no-store" });
  const retryAfter = upstream.headers.get("retry-after");
  if (retryAfter) headers.set("retry-after", retryAfter);
  return new NextResponse(await upstream.text(), { status: upstream.status, headers });
}
