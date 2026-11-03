import { timingSafeEqual } from "node:crypto";

import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Called by the FastAPI admin endpoints after a content edit so HTML, metadata,
 * structured data and the sitemap are regenerated together.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = request.headers.get("x-revalidate-secret") ?? "";
  if (!secret || given.length !== secret.length || !timingSafeEqual(Buffer.from(given), Buffer.from(secret))) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("content", { expire: 0 });
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() }, { headers: { "cache-control": "no-store" } });
}
