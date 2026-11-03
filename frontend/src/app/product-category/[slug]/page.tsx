import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";

import { CatalogBrowser } from "@/components/products/CatalogBrowser";
import { CompareTable } from "@/components/products/CompareTable";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ButtonLink } from "@/components/ui/Button";
import { ContactBand } from "@/components/ui/ContactBand";
import { PageHero } from "@/components/ui/PageHero";
import { Eyebrow, SectionHeader } from "@/components/ui/Section";
import { getCategories, getCategory, getCompany, getProducts, getServices } from "@/lib/content";
import { collectionLd, pageMetadata } from "@/lib/seo";
import { brandLabel, routes } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return pageMetadata({ title: category.seo.title, description: category.seo.description, path: routes.category(slug) });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, allProducts, company, services] = await Promise.all([
    getCategory(slug),
    getProducts(),
    getCompany(),
    getServices(),
  ]);
  if (!category) notFound();

  const products = allProducts.filter((p) => p.category === category.slug);
  const brands = [...new Set(products.map(brandLabel))];
  const relatedServices = category.relatedServices
    .map((s) => services.find((svc) => svc.slug === s))
    .filter((s) => s !== undefined);

  return (
    <>
      <JsonLd
        data={collectionLd({
          name: category.h1,
          description: category.seo.description,
          path: routes.category(category.slug),
          products,
        })}
      />

      <PageHero
        compact
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Products", path: routes.products },
          { name: category.name, path: routes.category(category.slug) },
        ]}
        eyebrow={<Eyebrow tone="dark">{category.name}</Eyebrow>}
        title={category.h1}
        lede={<p>{category.intro}</p>}
        aside={
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.06]">
            {[
              ["Models listed", String(products.length)],
              ["Brands", brands.join(", ")],
              ["Pricing", "On request"],
              ["Setup", "Provisioned for you"],
            ].map(([k, v]) => (
              <div key={k} className="bg-ink-950/80 p-5">
                <dt className="text-eyebrow text-ink-400">{k}</dt>
                <dd className="mt-2.5 text-[1.05rem] font-medium tracking-tight text-white">{v}</dd>
              </div>
            ))}
          </dl>
        }
      />

      <section aria-labelledby="catalog-title" className="py-14 lg:py-20">
        <div className="container-site">
          <h2 id="catalog-title" className="sr-only">
            {category.name} models
          </h2>
          <CatalogBrowser products={products} facetLabel={category.facetLabel} />
          <p className="mt-8 flex max-w-3xl gap-3 text-sm leading-relaxed text-muted">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-700" />
            Specifications are as listed on our catalog and are confirmed against current manufacturer data with your
            quote. Availability of older models varies.
          </p>
        </div>
      </section>

      <section aria-labelledby="compare-title" className="border-t border-line bg-paper-2/50 py-20 lg:py-28">
        <div className="container-site">
          <SectionHeader eyebrow="Compare" id="compare-title" title={`Compare ${category.name} side by side`}>
            {category.slug === "ip-pbx"
              ? "Figures in brackets are maximums with expansion. Not every maximum is available at the same time; we size the configuration with you."
              : "Key listed specifications for every model in this category."}
          </SectionHeader>
          <div className="mt-12">
            <CompareTable category={category.slug} products={products} />
          </div>
        </div>
      </section>

      {relatedServices.length > 0 && (
        <section aria-labelledby="cat-services-title" className="py-20 lg:py-28">
          <div className="container-site">
            <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
              <div>
                <Eyebrow>Solutions</Eyebrow>
                <h2 id="cat-services-title" className="text-title mt-5 text-ink-950">
                  Installed as part of
                </h2>
              </div>
              <ButtonLink href={routes.products} variant="outline">
                All products
              </ButtonLink>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {relatedServices.map((s, i) => (
                <ServiceCard key={s.slug} service={s} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ContactBand
        company={company}
        title="Need a quote or a recommendation?"
        body="Tell us how many users, lines and sites you have. We’ll recommend models, confirm availability and send a written quote."
        location={`category_${category.slug}_band`}
      />
    </>
  );
}
