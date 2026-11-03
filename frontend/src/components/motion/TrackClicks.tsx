"use client";

import { useEffect } from "react";

import { track, type TrackEvent } from "@/lib/analytics";

/**
 * One delegated listener for elements marked with data-track, e.g.
 * <a data-track="contact_click" data-track-method="telegram" data-track-location="header">.
 * Only the method and location are sent; never personal data.
 */
export function TrackClicks() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      track(el.dataset.track as TrackEvent, {
        method: el.dataset.trackMethod,
        location: el.dataset.trackLocation,
      });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
