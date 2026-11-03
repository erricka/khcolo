import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";

import { ProductCard } from "@/components/products/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ContactBand } from "@/components/ui/ContactBand";
import { Eyebrow } from "@/components/ui/Section";
import { getCategories, getCompany, getProduct, getProducts } from "@/lib/content";
import { pageMetadata, productLd } from "@/lib/seo";
import { brandLabel, routes } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return pageMetadata({
    title: product.seo.title,
    description: product.seo.description,
    path: routes.product(slug),
    image: product.image
      ? { url: product.image.src, width: product.image.width, height: product.image.height, alt: product.image.alt }
      : undefined,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, products, categories, company] = await Promise.all([
    getProduct(slug),
    getProducts(),
    getCategories(),
    getCompany(),
  ]);
  if (!product) notFound();
  const category = categories.find((c) => c.slug === product.category)!;
  const siblings = products.filter((p) => p.category === product.category && p.slug !== product.slug);
  // Neighbours in catalog order make better "related" picks than random ones.
  const index = products.filter((p) => p.category === product.category).findIndex((p) => p.slug === product.slug);
  const related = [...siblings.slice(Math.max(0, index - 1)), ...siblings.slice(0, Math.max(0, index - 1))].slice(0, 4);

  return (
    <>
      <JsonLd data={productLd(product, category)} />

      <section className="relative overflow-hidden border-b border-line bg-white">
        <div
          aria-hidden
          className="bg-cells absolute inset-y-0 right-0 hidden w-[45%] bg-[position:right_-1px_top_-1px] [mask-image:linear-gradient(to_left,black_20%,transparent_90%)] lg:block"
        />
        <div className="container-site relative pt-8 pb-16 lg:pt-12 lg:pb-24">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Products", path: routes.products },
              { name: category.name, path: routes.category(category.slug) },
              { name: product.model, path: routes.product(product.slug) },
            ]}
          />
          <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <div
                data-spotlight
                className="bg-cells relative aspect-square overflow-hidden border border-line bg-paper-2 [--cell:46px]">
                {product.image && (
                  <Image
                    src={product.image.src}
                    alt={product.image.alt}
                    fill
                    loading="eager"
                    fetchPriority="high"
                    sizes="(min-width: 1024px) 560px, 100vw"
                    className="photo-multiply photo-settle object-contain p-8 sm:p-12"
                  />
                )}
                <span className="text-eyebrow absolute top-0 left-0 border-r border-b border-line bg-white px-3 py-2 text-[0.7rem] text-ink-600">
                  {product.facet}
                </span>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="enter" style={{ ["--d" as string]: 0 }}>
                <Eyebrow>{brandLabel(product)}</Eyebrow>
              </div>
              <h1 className="mt-5 text-ink-950">
                <span className="text-headline block">{product.name}</span>{" "}
                <span className="mt-3 block text-lg font-normal tracking-normal text-muted">
                  {product.type}
                  {product.variant && <span className="text-ink-500"> · {product.variant}</span>}
                </span>
              </h1>
              <p className="text-lede mt-6 max-w-xl text-muted">
                {product.summary}
              </p>
              <ul className="enter mt-8 grid grid-cols-3 border-t border-l border-line" style={{ ["--d" as string]: 2 }}>
                {product.keySpecs.map((s) => (
                  <li key={s} className="border-r border-b border-line bg-white px-4 py-4 font-mono text-[0.82rem] leading-snug text-ink-900">
                    {s}
                  </li>
                ))}
              </ul>
              <div className="enter mt-9 flex flex-wrap gap-3" style={{ ["--d" as string]: 3 }}>
                <ButtonLink
                  href={routes.quote(product.slug)}
                  size="lg"
                  icon="arrow"
                  data-track="quote_click"
                  data-track-method="form"
                  data-track-location="product"
                >
                  Request a quote
                </ButtonLink>
                <ButtonLink
                  href={company.telegram.url}
                  variant="secondary"
                  size="lg"
                  data-track="contact_click"
                  data-track-method="telegram"
                  data-track-location="product"
                >
                  Ask on Telegram
                </ButtonLink>
              </div>
              <p className="enter mt-6 text-sm text-muted" style={{ ["--d" as string]: 3 }}>
                Price and availability confirmed on quotation. Supplied, provisioned and supported by our team.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="specs-title" className="py-20 lg:py-28">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4" data-reveal>
            <Eyebrow index="01">Specifications</Eyebrow>
            <h2 id="specs-title" className="text-title mt-5 text-ink-950">
              {product.model} at a glance
            </h2>
            <p className="mt-5 leading-relaxed text-muted">
              Listed specifications. We confirm them against current manufacturer data, along with any accessories you
              need, when we quote.
            </p>
          </div>
          <div className="lg:col-span-8">
            <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-card)]" data-reveal>
              {product.specs.map((s) => (
                <div key={s.label} className="grid gap-1 px-6 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
                  <dt className="text-eyebrow pt-1 text-muted">{s.label}</dt>
                  <dd className="text-ink-950">{s.value}</dd>
                </div>
              ))}
            </dl>

            {product.accessories.length > 0 && (
              <div className="mt-8" data-reveal>
                <h3 className="text-eyebrow text-brand-700">Listed accessories</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {product.accessories.map((a) => (
                    <li key={a} className="border border-line bg-white px-4 py-2 font-mono text-[0.82rem] text-ink-800">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.publicNotes.length > 0 && (
              <div className="mt-8 border-l-2 border-brand-600 bg-brand-50 p-5" data-reveal>
                {product.publicNotes.map((n) => (
                  <p key={n} className="flex gap-3 text-[0.95rem] leading-relaxed text-brand-800">
                    <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
                    {n}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-products-title" className="border-t border-line bg-paper-2/50 py-20 lg:py-28">
          <div className="container-site">
            <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
              <div>
                <Eyebrow index="02">More {category.name}</Eyebrow>
                <h2 id="related-products-title" className="text-title mt-5 text-ink-950">
                  Related models
                </h2>
              </div>
              <ButtonLink href={routes.category(category.slug)} variant="outline">
                All {category.productCount} {category.name}
              </ButtonLink>
            </div>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p, i) => (
                <li key={p.slug} data-reveal style={{ ["--i" as string]: i }}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ContactBand
        company={company}
        title={`Get a quote for the ${product.model}.`}
        body="Tell us how many you need and what they’ll connect to. We’ll confirm compatibility, availability and price."
        location={`product_${product.slug}_band`}
      />
    </>
  );
}
