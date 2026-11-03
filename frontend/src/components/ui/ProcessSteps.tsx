/** Numbered blue squares joined by a hairline that draws across when the row enters view. */
export function ProcessSteps({ steps, tone = "light" }: { steps: { title: string; body: string }[]; tone?: "light" | "dark" }) {
  void tone;
  const cols = steps.length >= 5 ? "lg:grid-cols-5" : steps.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  return (
    <div className="relative">
      <div aria-hidden data-reveal-line className="absolute top-[0.8rem] right-0 left-0 hidden h-px bg-line-strong lg:block" />
      <ol className={`relative grid gap-10 sm:grid-cols-2 lg:gap-8 ${cols}`}>
        {steps.map((step, i) => (
          <li key={step.title} data-reveal style={{ ["--i" as string]: i }} className="relative">
            <span className="relative z-10 flex size-[1.6rem] items-center justify-center bg-brand-600 font-mono text-[0.8rem] text-white tabular-nums">
              {i + 1}
            </span>
            <h3 className="mt-6 text-[1.4rem] leading-tight tracking-[-0.022em] text-ink-950">{step.title}</h3>
            <p className="mt-3 leading-relaxed text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
