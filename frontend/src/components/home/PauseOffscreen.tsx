"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wraps decorative SVG motion:
 *  - pauses CSS and SMIL animation while it is off screen
 *  - optionally tilts it a few degrees toward the pointer (desktop only,
 *    never for visitors who prefer reduced motion)
 */
export function PauseOffscreen({
  children,
  className = "",
  tilt = false,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const svgs = Array.from(el.querySelectorAll("svg"));
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        el.dataset.paused = String(!visible);
        for (const svg of svgs) {
          try {
            if (visible) svg.unpauseAnimations();
            else svg.pauseAnimations();
          } catch {
            /* engines without SMIL control */
          }
        }
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const target = stage.current;
    const area = ref.current?.closest("section");
    if (!tilt || !target || !area) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const MAX = 5; // degrees
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = target.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        target.style.setProperty("--ry", `${Math.max(-1, Math.min(1, x)) * MAX}deg`);
        target.style.setProperty("--rx", `${Math.max(-1, Math.min(1, -y)) * MAX * 0.7}deg`);
      });
    };
    const reset = () => {
      target.style.setProperty("--rx", "0deg");
      target.style.setProperty("--ry", "0deg");
    };
    area.addEventListener("pointermove", onMove as EventListener, { passive: true });
    area.addEventListener("pointerleave", reset);
    return () => {
      area.removeEventListener("pointermove", onMove as EventListener);
      area.removeEventListener("pointerleave", reset);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [tilt]);

  return (
    <div ref={ref} className={className} aria-hidden>
      <div ref={stage} className={tilt ? "tilt-stage" : undefined}>
        {children}
      </div>
    </div>
  );
}
