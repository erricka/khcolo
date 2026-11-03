/** Numbered steps joined by a line that draws across when the row enters view. */
export function ProcessSteps({ steps, tone = "light" }: { steps: { title: string; body: string }[]; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  const cols = steps.length >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-4";
  return (
    <div className="relative">
      <div
        aria-hidden
        data-reveal-line
        className={`absolute top-[1.15rem] right-0 left-0 hidden h-px lg:block ${dark ? "bg-white/15" : "bg-ink-900/15"}`}
      />
      <ol className={`relative grid gap-10 sm:grid-cols-2 lg:gap-8 ${cols}`}>
        {steps.map((step, i) => (
          <li key={step.title} data-reveal style={{ ["--i" as string]: i }} className="relative">
            <span
              className={`relative z-10 flex size-[2.3rem] items-center justify-center rounded-full border text-[0.8rem] font-semibold tabular-nums ${
                dark ? "border-brand-300/40 bg-ink-900 text-brand-300" : "border-brand-700/25 bg-paper text-brand-700"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className={`mt-5 text-lg font-semibold tracking-tight ${dark ? "text-white" : "text-ink-950"}`}>{step.title}</h3>
            <p className={`mt-2 leading-relaxed ${dark ? "text-ink-300" : "text-muted"}`}>{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
