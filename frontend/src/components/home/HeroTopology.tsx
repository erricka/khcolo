import {
  ArchiveRestore,
  Building2,
  Cloud,
  PhoneCall,
  ShieldCheck,
  UsersRound,
  Video,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { PauseOffscreen } from "./PauseOffscreen";

/**
 * Decorative diagram: every service layer connected to one local support team.
 * Rendered on the server as static SVG; CSS/SMIL motion pauses off screen and is
 * removed for visitors who prefer reduced motion. It carries no data or claims.
 */

const W = 640;
const H = 600;
const CX = 320;
const CY = 300;

type Node = { label: string; sub: string; angle: number; icon: LucideIcon };

const NODES: Node[] = [
  { label: "CRM", sub: "Bitrix24", angle: -90, icon: UsersRound },
  { label: "Cloud & VPS", sub: "Hosting", angle: -45, icon: Cloud },
  { label: "Backup", sub: "Acronis", angle: 0, icon: ArchiveRestore },
  { label: "Endpoints", sub: "ESET", angle: 45, icon: ShieldCheck },
  { label: "IT care", sub: "Maintenance", angle: 90, icon: Wrench },
  { label: "Meeting rooms", sub: "Yealink", angle: 135, icon: Video },
  { label: "Head office", sub: "IP PBX", angle: 180, icon: Building2 },
  { label: "Call center", sub: "3CX", angle: -135, icon: PhoneCall },
];

const RX = 236;
const RY = 228;
const CARD_W = 152;
const CARD_H = 50;

function point(angle: number) {
  const r = (angle * Math.PI) / 180;
  return { x: CX + RX * Math.cos(r), y: CY + RY * Math.sin(r) };
}

/** A gentle curve from the hub to a node, all bending the same way. */
function connection(angle: number) {
  const end = point(angle);
  const swirl = (18 * Math.PI) / 180;
  const a = (angle * Math.PI) / 180;
  const dist = Math.hypot(end.x - CX, end.y - CY);
  const c1 = { x: CX + Math.cos(a + swirl) * dist * 0.38, y: CY + Math.sin(a + swirl) * dist * 0.38 };
  const c2 = { x: end.x - Math.cos(a - swirl) * dist * 0.34, y: end.y - Math.sin(a - swirl) * dist * 0.34 };
  const f = (n: number) => n.toFixed(1);
  return `M${CX} ${CY} C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(end.x)} ${f(end.y)}`;
}

export function HeroTopology({ className = "", tilt = false }: { className?: string; tilt?: boolean }) {
  const paths = NODES.map((n) => connection(n.angle));

  return (
    <PauseOffscreen className={className} tilt={tilt}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" focusable="false">
        <defs>
          <radialGradient id="topo-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3d68f2" stopOpacity="0.34" />
            <stop offset="60%" stopColor="#3d68f2" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#3d68f2" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="topo-pulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#eef3ff" stopOpacity="1" />
            <stop offset="45%" stopColor="#8eabff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8eabff" stopOpacity="0" />
          </radialGradient>
          {paths.map((d, i) => (
            <path key={i} id={`topo-path-${i}`} d={d} />
          ))}
        </defs>

        {/* Orbit and rings */}
        <circle cx={CX} cy={CY} r={210} fill="url(#topo-glow)" />
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeDasharray="2 6" />
        <circle cx={CX} cy={CY} r={150} fill="none" stroke="rgb(255 255 255 / 0.05)" />
        <g className="topo-spin" style={{ transformOrigin: `${CX}px ${CY}px` }}>
          <circle cx={CX} cy={CY} r={88} fill="none" stroke="rgb(142 171 255 / 0.4)" strokeDasharray="1 7" strokeLinecap="round" strokeWidth={1.4} />
        </g>

        {/* Connections: base line draws in, then a slow dashed flow */}
        {paths.map((d, i) => (
          <g key={i}>
            <path
              d={d}
              pathLength={1}
              fill="none"
              stroke="rgb(142 171 255 / 0.3)"
              strokeWidth={1.2}
              className="topo-draw"
              style={{ animationDelay: `${300 + i * 70}ms` }}
            />
            <path
              d={d}
              fill="none"
              stroke="rgb(184 203 255 / 0.6)"
              strokeWidth={1.2}
              strokeDasharray="2 12"
              strokeLinecap="round"
              className="topo-flow motion-decor"
              style={{ animationDelay: `${1100 + i * 70}ms, ${(i % 4) * -0.6}s` }}
            />
          </g>
        ))}

        {/* Travelling pulses (SMIL so they follow the curves everywhere) */}
        <g className="motion-decor">
          {[0, 2, 3, 5, 7].map((pi, k) => (
            <circle key={pi} r={7} fill="url(#topo-pulse)" opacity={0}>
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="3.2s" begin={`${1.6 + k * 0.9}s`} repeatCount="indefinite" />
              <animateMotion dur="3.2s" begin={`${1.6 + k * 0.9}s`} repeatCount="indefinite" keyPoints={k % 2 ? "1;0" : "0;1"} keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.25 1">
                <mpath href={`#topo-path-${pi}`} />
              </animateMotion>
            </circle>
          ))}
        </g>

        {/* Hub */}
        <g className="topo-node" style={{ animationDelay: "120ms" }}>
          <circle cx={CX} cy={CY} r={56} fill="#0c1834" stroke="rgb(142 171 255 / 0.5)" strokeWidth={1.2} />
          <circle cx={CX} cy={CY} r={56} fill="none" stroke="rgb(142 171 255 / 0.55)" className="topo-ring motion-decor" style={{ transformOrigin: `${CX}px ${CY}px` }} />
          {/* Globe, after the "O" in the KHCOLO wordmark */}
          <g transform={`translate(${CX} ${CY})`}>
            <circle r={25} fill="#5f86fb" />
            <path d="M-25 -10 Q0 -17 25 -10 M-25 0 L25 0 M-25 10 Q0 17 25 10 M0 -25 L0 25" stroke="#0c1834" strokeWidth={2.6} fill="none" />
          </g>
          <rect x={CX - 62} y={CY + 70} width={124} height={22} rx={11} fill="#070f24" stroke="rgb(255 255 255 / 0.08)" />
          <text x={CX} y={CY + 84.5} textAnchor="middle" fill="#a7b3cc" fontSize={9.5} letterSpacing="0.16em" style={{ fontFamily: "var(--font-mono)" }}>
            ONE LOCAL TEAM
          </text>
        </g>

        {/* Nodes */}
        {NODES.map((n, i) => {
          const p = point(n.angle);
          const Icon = n.icon;
          return (
            <g key={n.label} transform={`translate(${(p.x - CARD_W / 2).toFixed(1)} ${(p.y - CARD_H / 2).toFixed(1)})`}>
              <g className="topo-node" style={{ animationDelay: `${520 + i * 75}ms` }}>
                <rect width={CARD_W} height={CARD_H} rx={12} fill="#0c1834" stroke="rgb(255 255 255 / 0.09)" />
                <rect x={10} y={11} width={28} height={28} rx={8} fill="rgb(95 134 251 / 0.12)" stroke="rgb(142 171 255 / 0.25)" />
                <Icon x={17} y={18} width={14} height={14} color="#8eabff" strokeWidth={1.8} />
                <text x={48} y={23} fill="#ffffff" fontSize={12.5} fontWeight={500} style={{ fontFamily: "var(--font-sans)" }}>
                  {n.label}
                </text>
                <text x={48} y={37} fill="#7d8cab" fontSize={9} letterSpacing="0.12em" style={{ fontFamily: "var(--font-mono)" }}>
                  {n.sub.toUpperCase()}
                </text>
                <circle cx={CARD_W - 11} cy={11} r={2.2} fill={i % 2 ? "#34d399" : "#8eabff"} className={i % 2 ? "topo-blink motion-decor" : undefined} style={{ animationDelay: `${i * 0.4}s` }} />
              </g>
            </g>
          );
        })}
      </svg>
    </PauseOffscreen>
  );
}
