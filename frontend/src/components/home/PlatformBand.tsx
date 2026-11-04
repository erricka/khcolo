import {
  BarChart3,
  CalendarDays,
  Headset,
  ListChecks,
  MessagesSquare,
  Phone,
  UsersRound,
  Video,
  Workflow,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { ButtonLink } from "@/components/ui/Button";

// 3CX and Bitrix24, and the tools the old Bitrix24 page lists as integrations. No hardware,
// hosting or security vendors while the public scope is limited to phone system and CRM work.
const MARKS = ["3CX", "Bitrix24", "WhatsApp", "Telegram", "Zoom", "Office 365", "Zapier", "Xero"];
const ic = "size-6";
const ICONS: { node: ReactNode; label: string }[] = [
  { node: <Phone className={ic} strokeWidth={1.7} />, label: "Calls" },
  { node: <Headset className={ic} strokeWidth={1.7} />, label: "Call queues" },
  { node: <MessagesSquare className={ic} strokeWidth={1.7} />, label: "Live chat" },
  { node: <Video className={ic} strokeWidth={1.7} />, label: "Video meetings" },
  { node: <UsersRound className={ic} strokeWidth={1.7} />, label: "CRM" },
  { node: <ListChecks className={ic} strokeWidth={1.7} />, label: "Tasks" },
  { node: <CalendarDays className={ic} strokeWidth={1.7} />, label: "Calendars" },
  { node: <BarChart3 className={ic} strokeWidth={1.7} />, label: "Reports" },
  { node: <Workflow className={ic} strokeWidth={1.7} />, label: "Workflows" },
];

function Row({ children, reverse, dur }: { children: ReactNode; reverse?: boolean; dur: number }) {
  return (
    <div className="overflow-hidden">
      <div className="marquee" data-reverse={reverse ? "" : undefined} style={{ ["--marquee-dur" as string]: `${dur}s` } as CSSProperties}>
        <div className="flex shrink-0 gap-3.5 pr-3.5">{children}</div>
        <div className="flex shrink-0 gap-3.5 pr-3.5" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Tinted band of 3CX and Bitrix24 capabilities moving past. */
export function PlatformBand() {
  return (
    <section aria-labelledby="platforms-band-title" className="bg-tint relative overflow-hidden border-y border-brand-100">
      <div className="container-site grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="lg:col-span-4" data-reveal="blur">
          <h2 id="platforms-band-title" className="text-title text-ink-950">
            Calls, chat and CRM in one place.
          </h2>
          <p className="mt-4 max-w-sm leading-relaxed text-muted">
            3CX and Bitrix24, configured to work together and with the tools your team already uses.
          </p>
          <ButtonLink href="#solutions" className="mt-8" icon="arrow">
            Explore solutions
          </ButtonLink>
        </div>
        <div
          className="marquee-host relative min-w-0 space-y-3.5 lg:col-span-8 lg:-mr-[max(2.5rem,calc((100vw_-_1280px)/2_+_2.5rem))] [mask-image:linear-gradient(to_right,transparent,black_12%,black_92%,transparent)]"
          aria-label="3CX and Bitrix24 capabilities and integrations"
          role="group"
        >
          <Row dur={84}>
            {/* Listed twice so one copy is always wider than the band; the repeat is hidden from screen readers. */}
            {[...MARKS, ...MARKS].map((m, i) => (
              <span
                key={`${m}-${i}`}
                aria-hidden={i >= MARKS.length || undefined}
                className="flex h-[68px] min-w-[68px] shrink-0 items-center justify-center bg-brand-600 px-5 text-[1.05rem] font-semibold tracking-[-0.025em] text-white"
              >
                {m}
              </span>
            ))}
          </Row>
          <Row dur={100} reverse>
            {[...ICONS, ...ICONS].map((t, i) => (
              <span
                key={`${t.label}-${i}`}
                aria-hidden={i >= ICONS.length || undefined}
                title={t.label}
                className="flex size-[68px] shrink-0 items-center justify-center bg-brand-600 text-white"
              >
                {t.node}
                <span className="sr-only">{t.label}</span>
              </span>
            ))}
          </Row>
        </div>
      </div>
    </section>
  );
}
