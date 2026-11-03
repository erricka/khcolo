/**
 * Conversion events for Google Tag Manager / GA4.
 *
 * Events only ever carry the action and where it happened. Never pass names,
 * emails, phone numbers or message text into analytics.
 */
export type TrackEvent = "contact_click" | "quote_click" | "inquiry_submitted";

type Params = Record<string, string | number | boolean | undefined>;

export function track(event: TrackEvent, params: Params = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, ...params });
}
