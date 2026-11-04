import type { CSSProperties } from "react";

/**
 * An example of how a conversation can move through 3CX into Bitrix24.
 * Every label comes from the 3CX and Bitrix24 service capabilities; it is not live data.
 */
const STEPS = [
  { label: "Channels", value: "Calls · Video · WhatsApp · Live chat" },
  { label: "3CX", value: "Call queues" },
  { label: "Agents", value: "Presence · Wallboards" },
  { label: "Bitrix24", value: "Lead capture · Tasks · Reporting" },
];

export function CallFlow() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[420px]">
      <ol className="relative space-y-6">
        {STEPS.map((s, i) => (
          <li key={s.label} className="relative" data-reveal style={{ ["--i" as string]: i } as CSSProperties}>
            <div className={`relative border bg-white px-4 py-3 ${i === STEPS.length - 1 ? "border-brand-600" : "border-line"}`}>
              <p className="font-mono text-[0.64rem] tracking-[0.08em] text-ink-500 uppercase">{s.label}</p>
              <p className="mt-1 text-[0.92rem] text-ink-900">{s.value}</p>
              {i === 0 && (
                <span className="absolute top-3 right-3 font-mono text-[0.62rem] text-ink-500 uppercase">Example</span>
              )}
            </div>
            {i < STEPS.length - 1 && (
              <span className="absolute top-full left-6 h-6 w-px bg-brand-600/40">
                <span
                  className="travel-y absolute -left-[2.5px] size-1.5 bg-brand-600"
                  style={{ ["--d" as string]: `${i * 0.6}s`, ["--len" as string]: "18px" } as CSSProperties}
                />
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
