import {
  Cloud,
  DatabaseBackup,
  Headset,
  Lock,
  MessagesSquare,
  Phone,
  Router,
  Server,
  ShieldCheck,
  Video,
  Wrench,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { ButtonLink } from "@/components/ui/Button";

const MARKS = ["3CX", "Bitrix24", "Yealink", "Yeastar", "ESET", "cPanel", "Proxmox"];
const ic = "size-6";
const ICONS: { node: ReactNode; label: string }[] = [
  { node: <Phone className={ic} strokeWidth={1.7} />, label: "Phone systems" },
  { node: <Headset className={ic} strokeWidth={1.7} />, label: "Call centers" },
  { node: <Video className={ic} strokeWidth={1.7} />, label: "Video rooms" },
  { node: <MessagesSquare className={ic} strokeWidth={1.7} />, label: "Chat" },
  { node: <ShieldCheck className={ic} strokeWidth={1.7} />, label: "Endpoint security" },
  { node: <Lock className={ic} strokeWidth={1.7} />, label: "SSL" },
  { node: <DatabaseBackup className={ic} strokeWidth={1.7} />, label: "Backup" },
  { node: <Cloud className={ic} strokeWidth={1.7} />, label: "Cloud VPS" },
  { node: <Server className={ic} strokeWidth={1.7} />, label: "Servers" },
  { node: <Router className={ic} strokeWidth={1.7} />, label: "Gateways" },
  { node: <Wrench className={ic} strokeWidth={1.7} />, label: "Maintenance" },
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

/** Tinted band of platform tiles moving past, the brand's version of a "runs on" strip. */
export function PlatformBand() {
  return (
    <section aria-labelledby="platforms-band-title" className="bg-tint relative overflow-hidden border-y border-brand-100">
      <div className="container-site grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="lg:col-span-4" data-reveal="blur">
          <h2 id="platforms-band-title" className="text-title text-ink-950">
            Whatever your office runs on, we support it locally.
          </h2>
          <p className="mt-4 max-w-sm leading-relaxed text-muted">
            The platforms we license, deploy and look after for Cambodian businesses, from the phone on the desk to the
            server in the back room.
          </p>
          <ButtonLink href="#solutions" className="mt-8" icon="arrow">
            Explore solutions
          </ButtonLink>
        </div>
        <div
          className="marquee-host relative min-w-0 space-y-3.5 lg:col-span-8 lg:-mr-[max(2.5rem,calc((100vw_-_1280px)/2_+_2.5rem))] [mask-image:linear-gradient(to_right,transparent,black_12%,black_92%,transparent)]"
          aria-label="Platforms we support"
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
