import {
  Cloud,
  DatabaseBackup,
  Headset,
  Lock,
  Mail,
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
import { routes } from "@/lib/site";
import type { Company } from "@/lib/types";

type Tile = {
  node: ReactNode;
  tone: keyof typeof TONES;
  x: string;
  y: string;
  dur: number;
  delay: number;
  float: number;
  big?: boolean;
  mobile?: boolean;
};

const TONES = {
  blue: "bg-brand-50 text-brand-600",
  green: "bg-accent-50 text-accent-600",
  sky: "bg-sky-50 text-sky-600",
  indigo: "bg-indigo-50 text-indigo-600",
  teal: "bg-teal-50 text-teal-600",
};

const ic = "size-7";
const TILES: Tile[] = [
  { node: <span className="text-[1.05rem] font-semibold tracking-[-0.03em]">3CX</span>, tone: "blue", x: "6%", y: "9%", dur: 7, delay: 0, float: -10, mobile: true },
  { node: <Headset className={ic} />, tone: "green", x: "15%", y: "34%", dur: 8, delay: 1.2, float: 12 },
  { node: <ShieldCheck className={ic} />, tone: "indigo", x: "3%", y: "62%", dur: 9, delay: 0.6, float: -8 },
  { node: <Cloud className={ic} />, tone: "sky", x: "17%", y: "84%", dur: 7.5, delay: 2, float: 10, mobile: true },
  { node: <Video className={ic} />, tone: "teal", x: "29%", y: "4%", dur: 8.5, delay: 0.3, float: 9 },
  { node: <Lock className={ic} />, tone: "blue", x: "38%", y: "90%", dur: 9.5, delay: 1.6, float: -9 },
  { node: <MessagesSquare className={ic} />, tone: "green", x: "56%", y: "3%", dur: 7.8, delay: 0.9, float: 11 },
  { node: <span className="text-[0.95rem] font-semibold tracking-[-0.03em]">Bitrix24</span>, tone: "blue", x: "71%", y: "12%", dur: 8.8, delay: 0.2, float: -12, big: true, mobile: true },
  { node: <Server className={ic} />, tone: "sky", x: "90%", y: "30%", dur: 7.2, delay: 1.4, float: 10 },
  { node: <DatabaseBackup className={ic} />, tone: "indigo", x: "93%", y: "64%", dur: 9.2, delay: 0.5, float: -10 },
  { node: <Router className={ic} />, tone: "teal", x: "79%", y: "84%", dur: 8.2, delay: 1.9, float: 9, mobile: true },
  { node: <Wrench className={ic} />, tone: "green", x: "61%", y: "91%", dur: 7.6, delay: 1.1, float: -8 },
];

/** Closing call to action: a centred bordered box with floating service tiles around it. */
export function ContactBand({
  company,
  title = "Tell us what you’re running today.",
  body = "We’ll recommend the right setup, explain the options plainly and take care of the installation.",
  location = "contact_band",
}: {
  company: Company;
  title?: string;
  body?: string;
  location?: string;
}) {
  return (
    <section aria-labelledby="contact-band-title" className="relative overflow-hidden border-t border-line bg-white">
      <ul aria-hidden className="pointer-events-none absolute inset-0">
        {TILES.map((t, i) => (
          <li
            key={i}
            className={`absolute -translate-x-1/2 -translate-y-1/2 ${t.mobile ? "" : "hidden md:block"}`}
            style={{ left: t.x, top: t.y }}
          >
            <span
              className={`float-tile flex items-center justify-center ${TONES[t.tone]} ${
                t.big ? "h-14 w-24 sm:h-[72px] sm:w-[112px]" : "size-14 sm:size-[72px]"
              }`}
              style={
                {
                  ["--float-dur" as string]: `${t.dur}s`,
                  ["--float-delay" as string]: `-${t.delay}s`,
                  ["--float" as string]: `${t.float}px`,
                } as CSSProperties
              }
            >
              {t.node}
            </span>
          </li>
        ))}
      </ul>

      <div className="container-site relative py-28 sm:py-32 lg:py-40">
        <div className="relative mx-auto max-w-3xl border border-line bg-white/95 px-6 py-14 text-center backdrop-blur-sm sm:px-12 lg:py-20" data-reveal>
          <p className="text-eyebrow flex items-center justify-center gap-3 text-muted">
            <span lang="km" className="font-sans text-base tracking-normal normal-case text-brand-700">
              សួស្តី
            </span>
            <span aria-hidden className="h-3 w-px bg-line-strong" />
            Hello in Khmer or English
          </p>
          <h2 id="contact-band-title" className="text-headline mx-auto mt-6 max-w-[18ch] text-ink-950">
            {title}
          </h2>
          <p className="text-lede mx-auto mt-5 max-w-xl text-muted">{body}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink
              href={company.telegram.url}
              size="lg"
              icon="arrow"
              data-track="contact_click"
              data-track-method="telegram"
              data-track-location={location}
            >
              Talk to our team
            </ButtonLink>
            <ButtonLink href={routes.contact + "#inquiry"} variant="secondary" size="lg" icon={null}>
              Send an inquiry
            </ButtonLink>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[0.95rem] text-ink-900 tabular-nums">
            <a
              href={`tel:${company.phones[0].tel}`}
              className="link-underline inline-flex items-center gap-2 hover:text-brand-700"
              data-track="contact_click"
              data-track-method="phone"
              data-track-location={location}
            >
              <Phone aria-hidden className="size-3.5 text-brand-600" />
              {company.phones[0].display}
            </a>
            <a
              href={`mailto:${company.email}`}
              className="link-underline inline-flex items-center gap-2 hover:text-brand-700"
              data-track="contact_click"
              data-track-method="email"
              data-track-location={location}
            >
              <Mail aria-hidden className="size-3.5 text-brand-600" />
              {company.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
