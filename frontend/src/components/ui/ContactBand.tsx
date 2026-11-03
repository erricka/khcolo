import { Mail, Phone } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { routes } from "@/lib/site";
import type { Company } from "@/lib/types";

/** Closing call to action used at the end of most pages. */
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
    <section aria-labelledby="contact-band-title" className="py-20 lg:py-28">
      <div className="container-site">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-brand-600/10 bg-gradient-to-br from-brand-50 via-white to-white shadow-[var(--shadow-card)]">
      <div aria-hidden className="bg-blueprint-light absolute inset-0 [mask-image:radial-gradient(ellipse_at_80%_20%,black,transparent_65%)]" />
      <div
        aria-hidden
        className="glow-drift absolute -top-40 -right-40 size-[38rem] rounded-full bg-[radial-gradient(closest-side,rgb(61_104_242/0.14),transparent)]"
      />
      <div className="relative grid gap-12 px-6 py-16 sm:px-12 lg:grid-cols-12 lg:items-end lg:px-16 lg:py-20">
        <div className="lg:col-span-7" data-reveal>
          <p className="flex items-baseline gap-4 text-muted">
            <span lang="km" className="text-2xl text-brand-600">
              សួស្តី
            </span>
            <span className="text-eyebrow">Hello — Khmer or English</span>
          </p>
          <h2 id="contact-band-title" className="text-headline mt-6 text-ink-950">
            {title}
          </h2>
          <p className="text-lede mt-6 max-w-xl text-muted">{body}</p>
        </div>
        <div className="lg:col-span-5" data-reveal style={{ ["--i" as string]: 1 }}>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink
              href={company.telegram.url}
              size="lg"
              data-track="contact_click"
              data-track-method="telegram"
              data-track-location={location}
            >
              Talk to our team
            </ButtonLink>
            <ButtonLink href={routes.contact + "#inquiry"} variant="secondary" size="lg">
              Send an inquiry
            </ButtonLink>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[0.95rem] text-ink-700 tabular-nums lg:justify-end">
            <a
              href={`tel:${company.phones[0].tel}`}
              className="link-underline inline-flex items-center gap-2 hover:text-ink-950"
              data-track="contact_click"
              data-track-method="phone"
              data-track-location={location}
            >
              <Phone aria-hidden className="size-3.5 text-brand-600" />
              {company.phones[0].display}
            </a>
            <a
              href={`mailto:${company.email}`}
              className="link-underline inline-flex items-center gap-2 hover:text-ink-950"
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
      </div>
      </div>
    </section>
  );
}
