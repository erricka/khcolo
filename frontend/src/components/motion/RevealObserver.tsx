"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Reveals `[data-reveal]` and `[data-reveal-line]` elements once, the first time
 * they enter the viewport. Content is only hidden while the `js-reveal` class is
 * on <html>; the inline script in the layout removes it if this never mounts.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const w = window as unknown as { __khReveal?: boolean };
    w.__khReveal = true;
    const root = document.documentElement;
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed), [data-reveal-line]:not(.is-revealed)"),
    );
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
    targets.forEach((el) => io.observe(el));
    root.classList.add("js-reveal");
    return () => io.disconnect();
  }, [pathname]);

  return null;
}

/** Inline script for <head>: opt in to reveal styles, with a fail-safe. */
export const revealBootScript = `(function(){var d=document.documentElement;d.classList.add('js-reveal');setTimeout(function(){if(!window.__khReveal){d.classList.remove('js-reveal')}},2500)})();`;
