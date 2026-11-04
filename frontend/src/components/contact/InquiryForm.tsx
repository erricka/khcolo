"use client";

import { AnimatePresence, m } from "motion/react";
import { ArrowRight, CircleAlert, LoaderCircle, X } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

import { track } from "@/lib/analytics";
import { routes } from "@/lib/site";

/**
 * Google reCAPTCHA v3: invisible, scores the visit when the form is sent. Set
 * NEXT_PUBLIC_RECAPTCHA_SITE_KEY at build time to turn it on (the API checks the
 * token with RECAPTCHA_SECRET_KEY). Without a key the form works as before.
 */
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
const RECAPTCHA_ACTION = "inquiry";

type Grecaptcha = { ready(cb: () => void): void; execute(siteKey: string, options: { action: string }): Promise<string> };

/** A fresh token for this submission, or null if reCAPTCHA is off or couldn't load. */
function getRecaptchaToken(): Promise<string | null> {
  const g = (window as Window & { grecaptcha?: Grecaptcha }).grecaptcha;
  if (!RECAPTCHA_SITE_KEY || !g) return Promise.resolve(null);
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(null), 8000);
    const done = (token: string | null) => {
      window.clearTimeout(timer);
      resolve(token);
    };
    g.ready(() => g.execute(RECAPTCHA_SITE_KEY, { action: RECAPTCHA_ACTION }).then(done, () => done(null)));
  });
}

type Option = { value: string; label: string };
type Group = { label: string; options: Option[] };

type Values = {
  requestType: "general" | "quote" | "consultation";
  name: string;
  company: string;
  email: string;
  phone: string;
  preferredContact: "" | "email" | "phone" | "telegram";
  interest: string;
  productSlug: string;
  message: string;
  consent: boolean;
  website: string;
};

type Errors = Partial<Record<keyof Values | "form", string>>;

const INITIAL: Values = {
  requestType: "general",
  name: "",
  company: "",
  email: "",
  phone: "",
  preferredContact: "",
  interest: "",
  productSlug: "",
  message: "",
  consent: false,
  website: "",
};

const REQUEST_TYPES: { value: Values["requestType"]; label: string; hint: string }[] = [
  { value: "general", label: "A question", hint: "General inquiry" },
  { value: "quote", label: "A quote", hint: "Pricing and availability" },
  { value: "consultation", label: "A consultation", hint: "Meeting or site visit" },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9 ()\-.]{6,32}$/;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Enter your name.";
  if (!v.email.trim() && !v.phone.trim()) e.email = "Enter an email address or a phone number so we can reply.";
  if (v.email.trim() && !EMAIL.test(v.email.trim())) e.email = "Enter a valid email address, like name@company.com.";
  if (v.phone.trim() && (!PHONE.test(v.phone.trim()) || v.phone.replace(/\D/g, "").length < 6))
    e.phone = "Enter a valid phone number, like +855 12 345 678.";
  if (!v.interest) e.interest = "Choose what your request is about.";
  if (v.message.trim().length < 10) e.message = "Tell us a little more (at least 10 characters).";
  if (!v.consent) e.consent = "Please confirm you've read the privacy notice.";
  return e;
}

const FIELD_ORDER: (keyof Values)[] = ["name", "email", "phone", "interest", "message", "consent"];

/** Bring a status message into view (clear of the fixed header) and give it focus. */
function reveal(el: HTMLElement | null) {
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  el.focus({ preventScroll: true });
}

export function InquiryForm({ topics, products }: { topics: Group[]; products: Group[] }) {
  const [values, setValues] = useState<Values>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [reference, setReference] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const formId = useId();

  const productLabel = products.flatMap((g) => g.options).find((o) => o.value === values.productSlug)?.label;
  const knownTopics = new Set(topics.flatMap((g) => g.options.map((o) => o.value)));
  const knownProducts = new Set(products.flatMap((g) => g.options.map((o) => o.value)));

  // Prefill from links such as /contact-us/?type=quote&product=yeastar-s20
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const interest = params.get("interest") ?? "";
    const product = params.get("product") ?? "";
    setValues((v) => ({
      ...v,
      requestType: type === "quote" || type === "consultation" ? type : v.requestType,
      interest: knownTopics.has(interest) ? interest : knownProducts.has(product) ? "hardware" : v.interest,
      productSlug: knownProducts.has(product) ? product : v.productSlug,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    if (Object.keys(found).length) {
      setErrors(found);
      requestAnimationFrame(() => reveal(summaryRef.current));
      return;
    }
    setErrors({});
    setStatus("submitting");
    try {
      const recaptchaToken = await getRecaptchaToken();
      const res = await fetch("/api/inquiry/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          preferredContact: values.preferredContact || null,
          productSlug: values.productSlug || null,
          sourcePath: window.location.pathname,
          recaptchaToken,
        }),
      });
      if (res.status === 201) {
        const receipt = (await res.json()) as { id: string };
        setReference(receipt.id.slice(0, 8).toUpperCase());
        setStatus("success");
        track("inquiry_submitted", { request_type: values.requestType, interest: values.interest });
        return;
      }
      const body = await res.json().catch(() => null);
      setErrors(serverErrors(res.status, body));
      setStatus("error");
      requestAnimationFrame(() => reveal(summaryRef.current));
    } catch {
      setErrors({ form: "We couldn't reach our server. Check your connection and try again, or message us on Telegram." });
      setStatus("error");
      requestAnimationFrame(() => reveal(summaryRef.current));
    }
  }

  const errorList = (Object.entries(errors) as [keyof Errors, string | undefined][]).filter(([, msg]) => msg);
  const submitting = status === "submitting";

  return (
    <div className="relative">
      {RECAPTCHA_SITE_KEY && (
        <Script src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`} strategy="afterInteractive" />
      )}
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <m.div
            key="success"
            // Mounts after the form's exit animation, so focus it from the ref callback.
            ref={(el: HTMLDivElement | null) => {
              successRef.current = el;
              if (el) reveal(el);
            }}
            tabIndex={-1}
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start py-6 outline-none sm:py-10"
          >
            <svg viewBox="0 0 56 56" className="size-14" aria-hidden>
              <circle cx="28" cy="28" r="26" fill="none" stroke="#d1fae5" strokeWidth="2" />
              <m.circle
                cx="28" cy="28" r="26" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
                style={{ rotate: -90, transformOrigin: "50% 50%" }}
              />
              <m.path
                d="M18 29l7 7 13-15" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.55, ease: [0.25, 1, 0.5, 1] }}
              />
            </svg>
            <h3 className="mt-6 text-2xl tracking-tight text-ink-950">Request received</h3>
            <p className="mt-3 max-w-lg leading-relaxed text-muted">
              Thank you{values.name ? `, ${values.name.trim().split(/\s+/)[0]}` : ""}. Your request has been saved and our team
              will reply by {replyChannel(values)}.
              {values.requestType === "consultation" &&
                " This is a request, not a confirmed appointment: we'll contact you to agree a time."}
            </p>
            <p className="mt-5 font-mono text-xs text-ink-500">Reference {reference}</p>
            <button
              type="button"
              onClick={() => {
                setValues(INITIAL);
                setStatus("idle");
              }}
              className="mt-8 text-sm font-medium text-brand-700 underline decoration-brand-700/30 underline-offset-4 hover:decoration-brand-700"
            >
              Send another request
            </button>
          </m.div>
        ) : (
          <m.form
            key="form"
            id={formId}
            noValidate
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
            aria-describedby={`${formId}-required`}
          >
            <div ref={summaryRef} tabIndex={-1} className="outline-none" aria-live="assertive">
              {errorList.length > 0 && (
                <div role="alert" className="mb-8 border border-red-700/20 bg-red-50 p-5 text-[0.95rem] text-red-900">
                  <p className="flex items-center gap-2 font-semibold">
                    <CircleAlert aria-hidden className="size-4" />
                    {errors.form ? "Your request wasn't sent" : "Please check the highlighted fields"}
                  </p>
                  <ul className="mt-2 space-y-1 pl-6">
                    {errorList.map(([key, msg]) => (
                      <li key={key}>
                        {key === "form" ? (
                          msg
                        ) : (
                          <a href={`#${formId}-${key}`} className="underline underline-offset-2">
                            {msg}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <fieldset>
              <legend className="text-eyebrow text-muted">I&rsquo;d like</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {REQUEST_TYPES.map((t) => {
                  const checked = values.requestType === t.value;
                  return (
                    <label
                      key={t.value}
                      className={`relative flex cursor-pointer flex-col border px-4 py-3.5 transition-[border-color,background-color,box-shadow] duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600 has-[:focus-visible]:ring-offset-2 ${
                        checked ? "border-ink-950 bg-ink-950 text-white" : "border-line-strong/80 bg-white hover:border-ink-500"
                      }`}
                    >
                      <input
                        type="radio"
                        name="requestType"
                        value={t.value}
                        checked={checked}
                        onChange={() => set("requestType", t.value)}
                        className="sr-only"
                      />
                      <span className="font-medium">{t.label}</span>
                      <span className={`mt-0.5 text-[0.8rem] ${checked ? "text-ink-300" : "text-muted"}`}>{t.hint}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field id={`${formId}-name`} label="Your name" required error={errors.name}>
                {(props) => <input {...props} type="text" autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} maxLength={120} />}
              </Field>
              <Field id={`${formId}-company`} label="Company" optional>
                {(props) => <input {...props} type="text" autoComplete="organization" value={values.company} onChange={(e) => set("company", e.target.value)} maxLength={160} />}
              </Field>
              <Field id={`${formId}-email`} label="Email" error={errors.email} hint="Email or phone, at least one">
                {(props) => <input {...props} type="email" inputMode="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} maxLength={254} />}
              </Field>
              <Field id={`${formId}-phone`} label="Phone" error={errors.phone} hint="Include +855 if outside Cambodia">
                {(props) => <input {...props} type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} maxLength={40} />}
              </Field>
            </div>

            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-ink-950">
                Best way to reach you <span className="font-normal text-muted">(optional)</span>
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["email", "phone", "telegram"] as const).map((c) => {
                  const checked = values.preferredContact === c;
                  return (
                    <label
                      key={c}
                      className={`inline-flex h-10 cursor-pointer items-center border px-4 text-sm capitalize transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600 has-[:focus-visible]:ring-offset-2 ${
                        checked ? "border-brand-700 bg-brand-50 text-brand-800" : "border-line-strong/80 bg-white text-ink-800 hover:border-ink-500"
                      }`}
                    >
                      <input
                        type="radio"
                        name="preferredContact"
                        value={c}
                        checked={checked}
                        onChange={() => set("preferredContact", c)}
                        className="sr-only"
                      />
                      {c}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-8 grid grid-cols-1 gap-6">
              <Field id={`${formId}-interest`} label="What is it about?" required error={errors.interest}>
                {(props) => (
                  <select {...props} value={values.interest} onChange={(e) => set("interest", e.target.value)}>
                    <option value="" disabled>
                      Choose a topic
                    </option>
                    {topics.map((g) => (
                      <optgroup key={g.label} label={g.label}>
                        {g.options.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                )}
              </Field>

              {(values.interest === "hardware" || values.productSlug) && (
                <Field id={`${formId}-product`} label="Product" optional>
                  {(props) =>
                    values.productSlug && productLabel ? (
                      <div className="flex h-12 items-center justify-between border border-brand-700/25 bg-brand-50 pr-2 pl-4 text-brand-900">
                        <span className="truncate">{productLabel}</span>
                        <button
                          type="button"
                          onClick={() => set("productSlug", "")}
                          className="inline-flex size-8 items-center justify-center hover:bg-brand-100"
                          aria-label={`Remove ${productLabel}`}
                        >
                          <X aria-hidden className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <select {...props} value={values.productSlug} onChange={(e) => set("productSlug", e.target.value)}>
                        <option value="">Not sure yet</option>
                        {products.map((g) => (
                          <optgroup key={g.label} label={g.label}>
                            {g.options.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    )
                  }
                </Field>
              )}

              <Field
                id={`${formId}-message`}
                label="Your message"
                required
                error={errors.message}
                hint="Users, sites, what you run today, and any deadline"
              >
                {(props) => (
                  <textarea {...props} rows={5} value={values.message} onChange={(e) => set("message", e.target.value)} maxLength={4000} className={`${props.className} h-auto min-h-36 py-3`} />
                )}
              </Field>
            </div>

            {/* Honeypot: hidden from people and assistive tech */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={`${formId}-website`}>Leave this field empty</label>
              <input id={`${formId}-website`} type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set("website", e.target.value)} />
            </div>

            <div className="mt-8">
              <label htmlFor={`${formId}-consent`} className="flex cursor-pointer gap-3 text-[0.93rem] leading-relaxed text-ink-900">
                <input
                  id={`${formId}-consent`}
                  type="checkbox"
                  checked={values.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? `${formId}-consent-error` : undefined}
                  className="mt-1 size-4.5 shrink-0 accent-brand-700"
                />
                <span>
                  KHCOLO may use these details to reply to my request, as described in the{" "}
                  <Link href={routes.privacy} className="font-medium text-brand-700 underline underline-offset-2">
                    privacy notice
                  </Link>
                  .
                </span>
              </label>
              {errors.consent && (
                <p id={`${formId}-consent-error`} className="mt-2 pl-7 text-sm text-red-800">
                  {errors.consent}
                </p>
              )}
            </div>

            <div className="mt-9 flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p id={`${formId}-required`} className="text-sm text-muted">
                Fields marked <span aria-hidden>*</span>
                <span className="sr-only">with an asterisk</span> are required.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex h-12 items-stretch justify-center bg-ink-950 text-white transition-[background-color,transform] duration-200 hover:bg-ink-800 active:translate-y-px disabled:cursor-wait disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <span className="flex items-center px-6">Sending&hellip;</span>
                    <span className="flex w-11 items-center justify-center bg-brand-600">
                      <LoaderCircle aria-hidden className="size-4 animate-spin" />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center px-6">Send request</span>
                    <span className="flex w-11 items-center justify-center bg-brand-600 transition-colors group-hover:bg-brand-700">
                      <ArrowRight aria-hidden className="arrow-nudge size-4" />
                    </span>
                  </>
                )}
              </button>
            </div>
            {RECAPTCHA_SITE_KEY && (
              <p className="mt-5 text-xs leading-relaxed text-muted">
                This form is protected by reCAPTCHA and the Google{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink-950">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink-950">
                  Terms of Service
                </a>{" "}
                apply.
              </p>
            )}
          </m.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function replyChannel(v: Values) {
  if (v.preferredContact === "telegram") return "Telegram or phone";
  if (v.preferredContact === "phone" || (!v.email && v.phone)) return "phone";
  return "email";
}

function serverErrors(status: number, body: unknown): Errors {
  if (status === 400 && body && typeof body === "object" && typeof (body as { detail?: unknown }).detail === "string") {
    return { form: (body as { detail: string }).detail };
  }
  if (status === 429) {
    return { form: "We've received several requests from this connection. Please wait a few minutes, or message us on Telegram." };
  }
  if (status === 422 && body && typeof body === "object" && "detail" in body && Array.isArray((body as { detail: unknown }).detail)) {
    const out: Errors = {};
    for (const item of (body as { detail: { loc?: (string | number)[]; msg?: string }[] }).detail) {
      const field = item.loc?.[item.loc.length - 1];
      const msg = (item.msg ?? "Check this field.").replace(/^Value error, /, "");
      const key = typeof field === "string" && (FIELD_ORDER as string[]).includes(field) ? (field as keyof Values) : "form";
      out[key] = msg.charAt(0).toUpperCase() + msg.slice(1);
    }
    return out;
  }
  return { form: "Something went wrong on our side and your request wasn't saved. Please try again, or contact us on Telegram or by phone." };
}

type ControlProps = {
  id: string;
  name: string;
  className: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
};

function Field({
  id,
  label,
  required,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: (props: ControlProps) => React.ReactNode;
}) {
  // The hint is replaced by the error message, so point at whichever is shown.
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const name = id.split("-").pop() ?? id;
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink-950">
        <span>
          {label}
          {required && (
            <span aria-hidden className="text-brand-700">
              {" "}*
            </span>
          )}
        </span>
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      <div className="mt-2">
        {children({
          id,
          name,
          "aria-invalid": Boolean(error),
          "aria-describedby": describedBy,
          "aria-required": required || undefined,
          className: `block h-12 w-full border bg-white px-4 text-[0.98rem] text-ink-950 shadow-[inset_0_1px_2px_rgb(8_18_43/0.04)] transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-ink-400 focus:ring-4 ${
            error
              ? "border-red-700/60 focus:border-red-700 focus:ring-red-700/10"
              : "border-line-strong/80 hover:border-ink-400 focus:border-brand-600 focus:ring-brand-500/15"
          }`,
        })}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-[0.8rem] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[0.85rem] text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
