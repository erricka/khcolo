"use client";

import { AnimatePresence, m } from "motion/react";
import { Plus } from "lucide-react";
import { useEffect, useId, useState } from "react";

/**
 * FAQ accordion. The server renders every answer open, so the content is readable
 * without JavaScript; once hydrated it collapses to one open item.
 */
export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const [hydrated, setHydrated] = useState(false);
  const baseId = useId();

  useEffect(() => setHydrated(true), []);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = !hydrated || open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div key={item.q} data-reveal style={{ ["--i" as string]: i }}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(open === i ? null : i)}
                className="group flex w-full items-start justify-between gap-6 py-6 text-left"
              >
                <span className="text-lg font-semibold tracking-tight text-ink-950 transition-colors group-hover:text-brand-700">
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color,color] duration-200 ${
                    isOpen ? "rotate-45 border-ink-950 bg-ink-950 text-white" : "border-line-strong text-ink-700 group-hover:border-ink-900"
                  }`}
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.25, 1, 0.5, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl pb-7 leading-relaxed text-muted">{item.a}</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
