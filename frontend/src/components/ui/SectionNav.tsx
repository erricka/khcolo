"use client";

import { m } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Sticky in-page navigation with a sliding indicator. Plain anchor links, so it
 * still works without JavaScript; the script only tracks the active section.
 */
export function SectionNav({ items, label = "On this page" }: { items: { id: string; label: string }[]; label?: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length || !("IntersectionObserver" in window)) return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        const current = items.find((i) => (visible.get(i.id) ?? 0) > 0);
        if (current) setActive(current.id);
        else if (sections[0].getBoundingClientRect().top > window.innerHeight * 0.45) setActive(items[0].id);
      },
      { rootMargin: "-140px 0px -55% 0px", threshold: [0, 0.01, 0.25] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav
      aria-label={label}
      className="sticky top-[var(--header-h)] z-30 border-b border-line bg-white/92 backdrop-blur-xl backdrop-saturate-150"
    >
      <span aria-hidden className="scroll-progress absolute inset-x-0 -bottom-px h-[2px] bg-gradient-to-r from-brand-600 via-brand-400 to-accent-400" />
      <div className="container-site">
        <ul className="-mx-1 flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const isActive = item.id === active;
            return (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={`relative inline-flex h-12 items-center px-4 text-sm transition-colors duration-200 ${
                    isActive ? "text-ink-950" : "text-muted hover:text-ink-950"
                  }`}
                >
                  {isActive && (
                    <m.span
                      layoutId="section-nav-pill"
                      className="absolute inset-x-4 bottom-0 h-0.5 bg-brand-600"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
