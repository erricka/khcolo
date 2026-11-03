"use client";

import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { ArrowUpRight, ChevronDown, Mail, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { routes } from "@/lib/site";

import type { NavData } from "./nav-data";

const ease = [0.16, 1, 0.3, 1] as const;

export function MobileNav({ nav, open, onClose }: { nav: NavData; open: boolean; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const focusFirst = requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("button, a")?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panel.current) return;
      const focusables = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(focusFirst);
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          key="mobile-nav"
          className="fixed inset-0 z-[60] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <m.div
            ref={panel}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%", transition: { duration: 0.24, ease: [0.65, 0, 0.35, 1] } }}
            transition={{ duration: 0.42, ease }}
            className="surface-dark bg-grain absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto bg-ink-950 text-white"
          >
            <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between px-4 sm:px-6">
              <Link href="/" className="text-white" aria-label="KHCOLO home">
                <Logo title={null} className="h-[22px] w-auto" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 inline-flex size-11 items-center justify-center rounded-full hover:bg-white/10"
                aria-label="Close menu"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 px-4 pb-8 sm:px-6">
              <ul className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                <Disclosure label="Solutions" id="m-solutions" open={section === "solutions"} onToggle={() => setSection(section === "solutions" ? null : "solutions")}>
                  {nav.groups.map((g) => (
                    <div key={g.key} className="pb-3">
                      <p className="text-eyebrow pt-3 pb-2 text-brand-300">{g.name}</p>
                      <ul>
                        {g.services.map((s) => (
                          <li key={s.slug}>
                            <Link href={routes.service(s.slug)} className="block rounded-lg py-2.5 text-ink-100 hover:text-white">
                              {s.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </Disclosure>
                <Disclosure label="Products" id="m-products" open={section === "products"} onToggle={() => setSection(section === "products" ? null : "products")}>
                  <ul className="pb-3">
                    {nav.categories.map((c) => (
                      <li key={c.slug}>
                        <Link href={routes.category(c.slug)} className="flex items-baseline justify-between rounded-lg py-2.5 text-ink-100 hover:text-white">
                          {c.name}
                          <span className="text-xs text-ink-400 tabular-nums">{c.count}</span>
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link href={routes.products} className="block py-2.5 text-brand-300">
                        All products
                      </Link>
                    </li>
                  </ul>
                </Disclosure>
                <li>
                  <Link href={routes.about} className="flex h-16 items-center text-xl font-medium tracking-tight">
                    About
                  </Link>
                </li>
                <li>
                  <Link href={routes.contact} className="flex h-16 items-center text-xl font-medium tracking-tight">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="space-y-2 border-t border-white/[0.08] p-4 sm:p-6">
              <a
                href={nav.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-13 items-center justify-between rounded-full bg-brand-500 px-6 font-medium text-white"
                data-track="contact_click"
                data-track-method="telegram"
                data-track-location="mobile_nav"
              >
                Talk to our team on Telegram
                <ArrowUpRight aria-hidden className="size-4" />
              </a>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${nav.phone.tel}`}
                  className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 text-sm"
                  data-track="contact_click"
                  data-track-method="phone"
                  data-track-location="mobile_nav"
                >
                  <Phone aria-hidden className="size-4 text-brand-300" /> Call
                </a>
                <a
                  href="mailto:support@khcolo.com"
                  className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 text-sm"
                  data-track="contact_click"
                  data-track-method="email"
                  data-track-location="mobile_nav"
                >
                  <Mail aria-hidden className="size-4 text-brand-300" /> Email
                </a>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

function Disclosure({
  label,
  id,
  open,
  onToggle,
  children,
}: {
  label: string;
  id: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="flex h-16 w-full items-center justify-between text-left text-xl font-medium tracking-tight"
      >
        {label}
        <ChevronDown aria-hidden className={`size-5 text-ink-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden"
          >
            {children}
          </m.div>
        )}
      </AnimatePresence>
    </li>
  );
}
