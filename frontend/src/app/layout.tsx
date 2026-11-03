import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Noto_Sans_Khmer } from "next/font/google";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { buildNavData } from "@/components/layout/nav-data";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { revealBootScript, RevealObserver } from "@/components/motion/RevealObserver";
import { Spotlight } from "@/components/motion/Spotlight";
import { TrackClicks } from "@/components/motion/TrackClicks";
import { getCategories, getCompany, getProducts, getServices } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Mono is only used for small labels, so it stays off the critical path.
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});

// Only downloaded when a page actually renders Khmer glyphs (unicode-range).
const khmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  variable: "--font-noto-khmer",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "KHCOLO",
  title: { default: "KHCOLO", template: "%s — KHCOLO" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [company, services, categories, products] = await Promise.all([
    getCompany(),
    getServices(),
    getCategories(),
    getProducts(),
  ]);
  const nav = buildNavData(company, services, categories, products);

  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${khmer.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealBootScript }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only-focusable fixed top-3 left-3 z-[100] bg-ink-950 px-5 py-3 text-white"
        >
          Skip to content
        </a>
        <MotionProvider>
          <SiteHeader nav={nav} />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter company={company} services={services} categories={categories} />
        </MotionProvider>
        <RevealObserver />
        <Spotlight />
        <TrackClicks />
      </body>
    </html>
  );
}
