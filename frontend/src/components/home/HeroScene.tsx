import { Loader2, Phone } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { PixelBlock } from "@/components/ui/Pixels";

import { PauseOffscreen } from "./PauseOffscreen";

/**
 * Hero illustration in the Render manner: a hairline cell grid with a dark
 * "incoming call" chip, a connector that draws into an example 3CX and Bitrix24
 * setup, and blue pixel blocks on the grid. It is labelled as an example and
 * shows no figures, so it cannot be read as live customer data.
 */

const CELL = 92;

type Status = { kind: "live" | "ok" | "busy"; label: string };
type Card = { icon: string; name: string; status: Status; charts: [string, string]; next: [string, string]; seed: number };

const CARDS: Card[] = [
  { icon: "phone", name: "3CX call queues", status: { kind: "ok", label: "Example" }, charts: ["Calls", "Queues"], next: ["Wallboards", "Presence"], seed: 3 },
  { icon: "phone", name: "3CX live chat", status: { kind: "ok", label: "Example" }, charts: ["Website chat", "WhatsApp"], next: ["Agents", "Reports"], seed: 11 },
  { icon: "crm", name: "Bitrix24 CRM", status: { kind: "ok", label: "Example" }, charts: ["Leads", "Deals"], next: ["Pipelines", "Workflows"], seed: 7 },
  { icon: "crm", name: "Bitrix24 tasks", status: { kind: "ok", label: "Example" }, charts: ["Tasks", "Projects"], next: ["Calendars", "Reports"], seed: 5 },
];

/** Deterministic wave whose last point equals its first, so two copies tile seamlessly. */
function wave(seed: number) {
  const n = 11;
  let x = seed * 9301 + 49297;
  const rand = () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
  const ys = Array.from({ length: n }, () => 10 + rand() * 22);
  ys[n - 1] = ys[0];
  return ys.map((y, i) => `${((i / (n - 1)) * 200).toFixed(1)},${y.toFixed(1)}`).join(" ");
}

function Spark({ seed, dur }: { seed: number; dur: number }) {
  const pts = wave(seed);
  const line = (
    <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="h-full w-1/2 shrink-0">
      <polyline points={pts} fill="none" stroke="var(--color-brand-600)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
  return (
    <div className="absolute inset-x-0 bottom-1 h-[60%] overflow-hidden">
      <div className="spark-track flex h-full w-[200%]" style={{ ["--spark-dur" as string]: `${dur}s` } as CSSProperties}>
        {line}
        {line}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: Status }) {
  if (status.kind === "busy")
    return (
      <span className="flex items-center gap-1.5 text-[0.7rem] text-muted">
        <Loader2 className="spin-slow size-3" />
        {status.label}
      </span>
    );
  if (status.kind === "live")
    return (
      <span className="flex items-center gap-1.5 text-[0.7rem] text-accent-700">
        <span className="status-dot size-1.5 rounded-full bg-accent-500" />
        {status.label}
      </span>
    );
  return <span className="font-mono text-[0.62rem] tracking-[0.06em] text-ink-500 uppercase">{status.label}</span>;
}

function Metric({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className="relative h-[46px] border border-line bg-white">
      <span className="absolute top-1.5 left-2 font-mono text-[0.58rem] tracking-[0.06em] text-ink-500 uppercase">{label}</span>
      {children}
    </div>
  );
}

function ServicePanelCard({ card, i }: { card: Card; i: number }) {
  return (
    <div
      className="enter h-[124px] overflow-hidden border border-line bg-white p-3"
      style={{ ["--d" as string]: 4 + i } as CSSProperties}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[0.78rem] text-ink-900">
          <ServiceIcon name={card.icon} className="size-3.5 text-ink-700" />
          {card.name}
        </span>
        <StatusChip status={card.status} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Metric label={card.charts[0]}>
          <Spark seed={card.seed} dur={8 + i} />
        </Metric>
        <Metric label={card.charts[1]}>
          <Spark seed={card.seed + 13} dur={10 + i} />
        </Metric>
        <Metric label={card.next[0]} />
        <Metric label={card.next[1]} />
      </div>
    </div>
  );
}

export function HeroScene({ className = "" }: { className?: string }) {
  return (
    <PauseOffscreen className={className}>
      <div className="relative h-full min-h-[560px] w-full overflow-hidden" style={{ ["--cell" as string]: `${CELL}px` } as CSSProperties}>
        {/* Grid */}
        <div className="bg-cells absolute inset-0 [mask-image:linear-gradient(to_right,transparent,black_18%),linear-gradient(to_bottom,black_80%,transparent)] [mask-composite:intersect]" />

        {/* Pixel blocks sitting in grid cells */}
        <PixelBlock pattern="a" className="absolute" style={{ left: CELL * 5 + 1, top: 1, width: CELL - 1, height: CELL - 1 }} />
        <PixelBlock pattern="b" className="absolute" style={{ left: CELL * 1 + 1, top: CELL * 5 + 1, width: CELL * 0.75, height: CELL - 1 }} />
        <PixelBlock pattern="c" className="absolute" style={{ left: CELL * 7 + 1, top: CELL * 5 + 1, width: CELL - 1, height: CELL / 2 }} />

        {/* Incoming call chip */}
        <div
          className="enter absolute flex h-14 items-center gap-3 bg-ink-800 px-5 font-mono text-[0.98rem] text-white"
          style={{ left: 0, top: CELL, ["--d" as string]: 1 } as CSSProperties}
        >
          <span className="relative flex size-2">
            <span className="status-dot absolute inset-0 rounded-full bg-accent-400" />
          </span>
          <Phone className="size-4 text-brand-300" strokeWidth={1.8} />
          incoming call
        </div>

        {/* Connector: down from the chip, then across into the panel */}
        <span
          className="draw-y absolute w-px bg-brand-600"
          style={{ left: 44, top: CELL + 56, height: CELL * 2 + 22 - (CELL + 56), ["--d" as string]: "700ms" } as CSSProperties}
        >
          <span
            className="travel-y absolute -left-[2.5px] size-1.5 bg-brand-600"
            style={{ ["--d" as string]: "1.6s", ["--len" as string]: `${CELL * 2 + 22 - (CELL + 56) - 6}px` } as CSSProperties}
          />
        </span>
        <span
          className="draw-x absolute h-px bg-brand-600"
          style={{ left: 44, top: CELL * 2 + 22, width: CELL - 44, ["--d" as string]: "1150ms" } as CSSProperties}
        />

        {/* The business: the systems we look after */}
        <div
          className="enter absolute border border-line bg-paper-2/95 p-4 backdrop-blur-[1px]"
          style={{ left: CELL, top: CELL * 2, width: 560, ["--d" as string]: 3 } as CSSProperties}
        >
          <p className="flex items-center justify-between font-mono text-[0.72rem] tracking-[0.08em] text-ink-500 uppercase">
            <span>Example setup</span>
            <span className="border border-line bg-white px-1.5 py-0.5 text-[0.62rem]">Illustration · not live data</span>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {CARDS.map((c, i) => (
              <ServicePanelCard key={c.name} card={c} i={i} />
            ))}
          </div>
        </div>
      </div>
    </PauseOffscreen>
  );
}
