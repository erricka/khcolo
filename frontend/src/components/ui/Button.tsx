import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

/**
 * Square buttons in the Render manner.
 *
 *   primary    black, with a blue block at the right edge that wipes across on hover
 *   secondary  white with a black hairline border; fills black on hover
 *   outline    alias of secondary
 *   dark       black; fills blue on hover, no resting block
 *   ghost      text only
 */
type Variant = "primary" | "secondary" | "ghost" | "dark" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "btn-wipe group relative inline-flex items-stretch justify-center overflow-hidden font-normal tracking-[-0.01em] whitespace-nowrap " +
  "transition-[color,border-color,transform] duration-200 ease-[var(--ease-out-quart)] " +
  "active:translate-y-px active:duration-75 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, { cls: string; fill: string | null }> = {
  primary: { cls: "bg-ink-950 text-white", fill: "bg-brand-600" },
  dark: { cls: "bg-ink-950 text-white", fill: "bg-brand-600" },
  secondary: { cls: "border border-ink-950 bg-white text-ink-950", fill: "bg-ink-950" },
  outline: { cls: "border border-ink-950 bg-white text-ink-950", fill: "bg-ink-950" },
  ghost: { cls: "text-current hover:text-brand-700", fill: null },
};

const sizes: Record<Size, { h: string; label: string; block: string; blockPx: number }> = {
  sm: { h: "h-9 text-[0.88rem]", label: "px-3.5", block: "w-8", blockPx: 32 },
  md: { h: "h-11 text-[0.95rem]", label: "px-5", block: "w-10", blockPx: 40 },
  lg: { h: "h-12 text-base", label: "px-6", block: "w-11", blockPx: 44 },
};

type Common = {
  variant?: Variant;
  size?: Size;
  icon?: "arrow" | "external" | ReactNode | null;
  className?: string;
  children: ReactNode;
};

function iconNode(icon: Common["icon"]) {
  if (icon === null) return null;
  if (icon === "external")
    return (
      <ArrowUpRight
        aria-hidden
        className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-px group-hover:-translate-y-px"
      />
    );
  if (icon === "arrow" || icon === undefined)
    return <ChevronRight aria-hidden className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />;
  return <>{icon}</>;
}

function Content({ size, icon, hasBlock, children }: { size: Size; icon: ReactNode; hasBlock: boolean; children: ReactNode }) {
  const s = sizes[size];
  return (
    <>
      <span className={`relative flex items-center ${s.label} ${icon && !hasBlock ? "pr-3.5" : ""}`}>{children}</span>
      {icon && <span className={`relative flex items-center justify-center ${hasBlock ? s.block : "pr-4"}`}>{icon}</span>}
    </>
  );
}

/** The fill layer repeats the label in the hover colour, so text and fill wipe in together. */
function Inner({ variant, size, icon, children }: { variant: Variant; size: Size; icon: ReactNode; children: ReactNode }) {
  const v = variants[variant];
  const hasBlock = variant === "primary" && icon !== null;
  return (
    <>
      <Content size={size} icon={icon} hasBlock={hasBlock}>
        {children}
      </Content>
      {v.fill && (
        <span aria-hidden className={`btn-fill flex items-stretch justify-center text-white ${v.fill}`}>
          <Content size={size} icon={icon} hasBlock={hasBlock}>
            {children}
          </Content>
        </span>
      )}
    </>
  );
}

function blockStyle(variant: Variant, size: Size, icon: ReactNode): CSSProperties | undefined {
  return variant === "primary" && icon !== null ? ({ ["--btn-block" as string]: `${sizes[size].blockPx}px` } as CSSProperties) : undefined;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  external,
  style,
  ...rest
}: Common & { href: string; external?: boolean } & Omit<ComponentProps<"a">, "href" | "children">) {
  const cls = `${base} ${variants[variant].cls} ${sizes[size].h} ${className}`;
  if (external || /^(https?:|tel:|mailto:)/.test(href)) {
    const isWeb = /^https?:/.test(href);
    const node = iconNode(icon ?? (isWeb ? "external" : "arrow"));
    return (
      <a
        href={href}
        className={cls}
        style={{ ...blockStyle(variant, size, node), ...style }}
        {...(isWeb ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        <Inner variant={variant} size={size} icon={node}>
          {children}
          {isWeb && <span className="sr-only"> (opens in a new tab)</span>}
        </Inner>
      </a>
    );
  }
  const node = iconNode(icon);
  return (
    <Link href={href} className={cls} style={{ ...blockStyle(variant, size, node), ...style }} {...rest}>
      <Inner variant={variant} size={size} icon={node}>
        {children}
      </Inner>
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  icon = null,
  className = "",
  children,
  style,
  ...rest
}: Common & Omit<ComponentProps<"button">, "children">) {
  const node = iconNode(icon);
  return (
    <button
      className={`${base} ${variants[variant].cls} ${sizes[size].h} ${className}`}
      style={{ ...blockStyle(variant, size, node), ...style }}
      {...rest}
    >
      <Inner variant={variant} size={size} icon={node}>
        {children}
      </Inner>
    </button>
  );
}
