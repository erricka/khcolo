import type { ReactNode } from "react";

/** Mono uppercase label with an optional index, e.g. "01 / Solutions". */
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
  const color = tone === "dark" ? "text-ink-300" : "text-muted";
  const num = tone === "dark" ? "text-brand-300" : "text-brand-700";
  return (
    <p className={`text-eyebrow flex items-center gap-2 ${color} ${className}`}>
      {index && (
        <>
          <span className={`tabular-nums ${num}`}>{index}</span>
          <span aria-hidden className="opacity-40">
            /
          </span>
        </>
      )}
      <span>{children}</span>
    </p>
  );
}

/** Standard section heading: label, large light headline and a lede beneath it. */
export function SectionHeader({
  eyebrow,
  index,
  title,
  children,
  tone = "light",
  id,
  className = "",
}: {
  eyebrow?: string;
  index?: string;
  title: ReactNode;
  children?: ReactNode;
  tone?: "light" | "dark";
  id?: string;
  className?: string;
}) {
  return (
    <div className={`max-w-3xl ${className}`}>
      <div data-reveal="blur">
        {eyebrow && (
          <Eyebrow index={index} tone={tone} className="mb-5">
            {eyebrow}
          </Eyebrow>
        )}
        <h2 id={id} className={`text-headline ${tone === "dark" ? "text-white" : "text-ink-950"}`}>
          {title}
        </h2>
      </div>
      {children && (
        <div
          className={`text-lede mt-5 max-w-2xl ${tone === "dark" ? "text-ink-300" : "text-muted"}`}
          data-reveal
          style={{ ["--i" as string]: 1 }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
