import type { ReactNode } from "react";

/** Small mono label with an optional index, e.g. "01 — Solutions". */
export function Eyebrow({
  children,
  index,
  tone = "light",
  className = "",
}: {
  children: ReactNode;
  index?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const color = tone === "dark" ? "text-brand-300" : "text-brand-700";
  const rule = tone === "dark" ? "bg-white/20" : "bg-ink-900/20";
  return (
    <p className={`text-eyebrow flex items-center gap-3 ${color} ${className}`}>
      {index && (
        <>
          <span className="tabular-nums">{index}</span>
          <span aria-hidden className={`h-px w-6 ${rule}`} />
        </>
      )}
      <span>{children}</span>
    </p>
  );
}

/** Standard section heading block: eyebrow, title and optional aside text. */
export function SectionHeader({
  eyebrow,
  index,
  title,
  children,
  tone = "light",
  id,
  className = "",
}: {
  eyebrow: string;
  index?: string;
  title: ReactNode;
  children?: ReactNode;
  tone?: "light" | "dark";
  id?: string;
  className?: string;
}) {
  return (
    <div className={`grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10 ${className}`}>
      <div className="lg:col-span-7" data-reveal="blur">
        <Eyebrow index={index} tone={tone}>
          {eyebrow}
        </Eyebrow>
        <h2 id={id} className={`text-headline mt-5 ${tone === "dark" ? "text-white" : "text-ink-950"}`}>
          {title}
        </h2>
      </div>
      {children && (
        <div
          className={`text-lede lg:col-span-5 lg:pb-1 ${tone === "dark" ? "text-ink-300" : "text-muted"}`}
          data-reveal
          style={{ ["--i" as string]: 1 }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
