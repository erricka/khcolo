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
