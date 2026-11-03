import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "dark" | "outline";
type Size = "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em] whitespace-nowrap " +
  "transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-[var(--ease-out-quart)] " +
  "active:translate-y-px active:duration-75 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "btn-sheen overflow-hidden bg-brand-500 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_1px_2px_rgb(5_11_29/0.3)] hover:bg-brand-600 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_10px_28px_-10px_rgb(61_104_242/0.75)]",
  secondary:
    "border border-ink-900/15 bg-white text-ink-900 shadow-[var(--shadow-card)] hover:border-brand-600/40 hover:text-brand-700",
  ghost: "text-current hover:bg-current/[0.06]",
  dark: "bg-ink-900 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] hover:bg-ink-800 hover:shadow-[0_10px_24px_-12px_rgb(5_11_29/0.6)]",
  outline: "border border-ink-900/20 bg-white/60 text-ink-900 hover:border-ink-900/45 hover:bg-white",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-6 text-base",
};

type Common = { variant?: Variant; size?: Size; icon?: "arrow" | "external" | ReactNode | null; className?: string; children: ReactNode };

function Icon({ icon }: { icon: Common["icon"] }) {
  if (icon === null) return null;
  if (icon === "external") return <ArrowUpRight aria-hidden className="arrow-nudge arrow-nudge-diag size-4 shrink-0" />;
  if (icon === "arrow" || icon === undefined) return <ArrowRight aria-hidden className="arrow-nudge size-4 shrink-0" />;
  return <>{icon}</>;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  external,
  ...rest
}: Common & { href: string; external?: boolean } & Omit<ComponentProps<"a">, "href" | "children">) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (external || /^(https?:|tel:|mailto:)/.test(href)) {
    const isWeb = /^https?:/.test(href);
    return (
      <a href={href} className={cls} {...(isWeb ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        {children}
        <Icon icon={icon ?? (isWeb ? "external" : null)} />
        {isWeb && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
      <Icon icon={icon} />
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  icon = null,
  className = "",
  children,
  ...rest
}: Common & Omit<ComponentProps<"button">, "children">) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
      <Icon icon={icon} />
    </button>
  );
}
