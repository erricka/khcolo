/**
 * Decorative pixel blocks that sit exactly inside one or two cells of a `bg-cells`
 * grid. Each row is a run of coloured segments, fading in one row at a time.
 */
type Seg = [number, string];

const PATTERNS: Record<"a" | "b" | "c", Seg[][]> = {
  a: [
    [[100, "var(--color-brand-600)"]],
    [[34, "var(--color-brand-200)"], [66, "var(--color-brand-600)"]],
    [[48, "transparent"], [52, "var(--color-brand-600)"]],
    [[100, "var(--color-brand-600)"]],
    [[30, "var(--color-brand-600)"], [44, "var(--color-brand-300)"], [26, "var(--color-accent-200)"]],
    [[62, "var(--color-brand-100)"], [38, "var(--color-brand-600)"]],
  ],
  b: [
    [[40, "var(--color-brand-100)"], [60, "transparent"]],
    [[22, "transparent"], [78, "var(--color-brand-600)"]],
    [[100, "var(--color-brand-500)"]],
    [[30, "var(--color-brand-200)"], [70, "var(--color-brand-600)"]],
    [[100, "var(--color-brand-600)"]],
    [[52, "var(--color-brand-600)"], [48, "var(--color-brand-300)"]],
    [[100, "var(--color-brand-600)"]],
    [[26, "var(--color-brand-200)"], [74, "var(--color-brand-600)"]],
  ],
  c: [
    [[100, "var(--color-accent-200)"]],
    [[60, "var(--color-brand-600)"], [40, "var(--color-accent-300)"]],
    [[100, "var(--color-brand-600)"]],
    [[36, "transparent"], [64, "var(--color-brand-400)"]],
  ],
};

export function PixelBlock({
  pattern = "a",
  className = "",
  style,
}: {
  pattern?: keyof typeof PATTERNS;
  className?: string;
  style?: React.CSSProperties;
}) {
  const rows = PATTERNS[pattern];
  return (
    <div aria-hidden className={`flex flex-col ${className}`} style={style}>
      {rows.map((row, ri) => (
        <div key={ri} className="pixel-in flex flex-1" style={{ ["--d" as string]: ri }}>
          {row.map(([w, c], si) => (
            <span key={si} style={{ width: `${w}%`, background: c }} />
          ))}
        </div>
      ))}
    </div>
  );
}
