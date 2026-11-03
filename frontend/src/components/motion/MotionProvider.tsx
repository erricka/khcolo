"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Shared motion defaults. `reducedMotion="user"` turns transforms off for visitors who ask for less motion. */
export const motionTokens = {
  fast: 0.18,
  base: 0.32,
  easeOut: [0.25, 1, 0.5, 1] as const,
  easeOutExpo: [0.16, 1, 0.3, 1] as const,
};

// Animation features arrive after first paint, keeping them off the critical path.
const loadFeatures = () => import("./features").then((mod) => mod.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: motionTokens.base, ease: motionTokens.easeOut }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
