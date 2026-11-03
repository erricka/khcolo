"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { ArrowRight, ChevronDown, Menu, Phone } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { routes } from "@/lib/site";

import { MobileNav } from "./MobileNav";
import type { NavData } from "./nav-data";

type MenuKey = "solutions" | "products";

export function SiteHeader({ nav }: { nav: NavData }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close everything on navigation.
  useEffect(() => {
    setOpen(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const solid = scrolled || open !== null;

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 h-[var(--header-h)]"
      data-scrolled={scrolled}
    >
      <div
        aria-hidden
        className={`absolute inset-0 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
          solid ? "border-line bg-white/85 shadow-[0_10px_30px_-24px_rgb(8_18_43/0.35)] backdrop-blur-xl backdrop-saturate-150" : "border-transparent bg-transparent"
        }`}
      />
      <div className="container-site relative flex h-full items-center gap-8">
        <Link href="/" className="-m-2 flex shrink-0 items-center rounded-md p-2" aria-label="KHCOLO home">
          <Logo title={null} id="logo-header" className="h-[25px] w-auto sm:h-[27px]" />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-[0.94rem]">
            <DesktopMenu
              id="solutions"
              label="Solutions"
              open={open === "solutions"}
              setOpen={setOpen}
              active={nav.groups.some((g) => g.services.some((s) => pathname === routes.service(s.slug)))}
            >
              <SolutionsPanel nav={nav} />
            </DesktopMenu>
            <DesktopMenu
              id="products"
              label="Products"
              open={open === "products"}
              setOpen={setOpen}
              active={pathname.startsWith("/product")}
            >
              <ProductsPanel nav={nav} />
            </DesktopMenu>
            <NavLink href={routes.about} active={pathname === routes.about}>
              About
            </NavLink>
            <NavLink href={routes.contact} active={pathname === routes.contact}>
              Contact
            </NavLink>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <a
            href={`tel:${nav.phone.tel}`}
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-ink-700 tabular-nums transition-colors hover:text-ink-950 xl:flex"
            data-track="contact_click"
            data-track-method="phone"
            data-track-location="header"
          >
            <Phone aria-hidden className="size-3.5 text-brand-600" strokeWidth={1.8} />
            {nav.phone.display}
          </a>
          <div className="hidden sm:block">
            <ButtonLink
              href={nav.telegram}
              data-track="contact_click"
              data-track-method="telegram"
              data-track-location="header"
            >
              Talk to our team
            </ButtonLink>
          </div>
          <button
            type="button"
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-full text-ink-950 transition-colors hover:bg-ink-950/5 lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen(true)}
          >
            <Menu aria-hidden className="size-5" />
          </button>
        </div>
      </div>

      <MobileNav nav={nav} open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`relative inline-flex h-10 items-center rounded-full px-4 transition-colors ${
          active ? "text-ink-950" : "text-ink-600 hover:text-ink-950"
        }`}
      >
        {children}
        {active && <span aria-hidden className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-brand-500" />}
      </Link>
    </li>
  );
}

function DesktopMenu({
  id,
  label,
  open,
  setOpen,
  active,
  children,
}: {
  id: MenuKey;
  label: string;
  open: boolean;
  setOpen: (v: MenuKey | null | ((prev: MenuKey | null) => MenuKey | null)) => void;
  active: boolean;
  children: React.ReactNode;
}) {
  const panelId = useId();
  const wrapper = useRef<HTMLLIElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const schedule = useCallback(
    (next: MenuKey | null, delay: number) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setOpen((prev) => (next === null && prev !== id ? prev : next)), delay);
    },
    [id, setOpen],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        trigger.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, setOpen]);

  return (
    <li
      ref={wrapper}
      onPointerEnter={(e) => e.pointerType === "mouse" && schedule(id, 70)}
      onPointerLeave={(e) => e.pointerType === "mouse" && schedule(null, 160)}
      onBlur={(e) => {
        if (!wrapper.current?.contains(e.relatedTarget as Node)) setOpen((prev) => (prev === id ? null : prev));
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          clearTimeout(timer.current);
          setOpen((prev) => (prev === id ? null : id));
        }}
        className={`relative inline-flex h-10 items-center gap-1.5 rounded-full px-4 transition-colors ${
          open || active ? "text-ink-950" : "text-ink-600 hover:text-ink-950"
        }`}
      >
        {label}
        <ChevronDown
          aria-hidden
          className={`size-3.5 text-ink-400 transition-transform duration-200 ${open ? "rotate-180 text-brand-600" : ""}`}
        />
        {active && <span aria-hidden className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-brand-500" />}
      </button>
      <AnimatePresence>
        {open && (
          <m.div
            id={panelId}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.14 } }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-x-4 top-[calc(100%-6px)] sm:inset-x-6 lg:inset-x-10"
          >
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_60px_-30px_rgb(8_18_43/0.35),0_2px_6px_-2px_rgb(8_18_43/0.06)]">
              {children}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function SolutionsPanel({ nav }: { nav: NavData }) {
  return (
    <div className="grid grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,0.95fr)]">
      {nav.groups.map((group, gi) => (
        <m.div
          key={group.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.04 + gi * 0.045, ease: [0.16, 1, 0.3, 1] }}
          className="border-r border-line p-6"
        >
          <p className="text-eyebrow tracking-[0.1em] whitespace-nowrap text-brand-600">{group.name}</p>
          <ul className="mt-5 space-y-1">
            {group.services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={routes.service(s.slug)}
                  className="group -mx-3 flex gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-paper"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-brand-600/10 bg-brand-50 text-brand-600 transition-colors group-hover:border-brand-600/30 group-hover:bg-white">
                    <ServiceIcon name={s.icon} className="size-4" />
                  </span>
                  <span>
                    <span className="block text-[0.94rem] font-medium text-ink-950">{s.name}</span>
                    <span className="mt-1 line-clamp-2 block text-[0.82rem] leading-snug text-muted">{s.summary}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </m.div>
      ))}
      <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-b from-brand-50 to-white p-6">
        <div>
          <p className="text-eyebrow text-muted">Not sure where to start?</p>
          <p className="mt-4 text-lg leading-snug font-medium text-ink-950">
            Tell us what you run today. We&rsquo;ll suggest what fits.
          </p>
          <a
            href={`tel:${nav.phone.tel}`}
            className="mt-6 flex items-center gap-2 text-sm font-medium text-ink-700 tabular-nums hover:text-ink-950"
            data-track="contact_click"
            data-track-method="phone"
            data-track-location="mega_menu"
          >
            <Phone aria-hidden className="size-3.5 text-brand-600" />
            {nav.phone.display}
          </a>
        </div>
        <Link
          href={routes.contact}
          className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Talk to our team
          <ArrowRight aria-hidden className="arrow-nudge size-4" />
        </Link>
      </div>
    </div>
  );
}

function ProductsPanel({ nav }: { nav: NavData }) {
  return (
    <div className="grid grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,0.8fr)]">
      {nav.categories.map((c, ci) => (
        <m.div
          key={c.slug}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.04 + ci * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="border-r border-line"
        >
          <Link
            href={routes.category(c.slug)}
            className="group block h-full p-5 transition-colors hover:bg-paper"
          >
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-paper">
              {c.image && (
                <Image
                  src={c.image.src}
                  alt=""
                  fill
                  sizes="300px"
                  className="photo-multiply object-contain p-3 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                />
              )}
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-3">
              <span className="font-medium text-ink-950">{c.name}</span>
              <span className="text-xs text-muted tabular-nums">{c.count} models</span>
            </div>
            <p className="mt-1.5 text-[0.82rem] leading-snug text-muted">{c.summary}</p>
          </Link>
        </m.div>
      ))}
      <div className="flex flex-col justify-between p-6">
        <div>
          <p className="text-eyebrow text-muted">Hardware</p>
          <p className="mt-4 leading-snug text-ink-700">
            No online checkout. Send us your requirements and we&rsquo;ll confirm price and availability.
          </p>
        </div>
        <Link
          href={routes.products}
          className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Browse all products
          <ArrowRight aria-hidden className="arrow-nudge size-4" />
        </Link>
      </div>
    </div>
  );
}
