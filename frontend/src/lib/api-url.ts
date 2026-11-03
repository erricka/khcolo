/**
 * FastAPI base URL as seen from the Next.js server, without a trailing slash.
 * Accepts a full URL or a bare "host:port" (Render's private network form).
 */
export function apiBaseUrl(): string | undefined {
  const raw = process.env.KHCOLO_API_URL?.trim();
  if (!raw) return undefined;
  const withScheme = raw.includes("://") ? raw : `http://${raw}`;
  return withScheme.replace(/\/$/, "");
}

/** Headers for server-to-server calls; includes the shared key when the API requires one. */
export function apiHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const key = process.env.INTERNAL_API_KEY;
  return key ? { ...extra, "x-internal-key": key } : extra;
}
