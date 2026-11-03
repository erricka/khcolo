import type { Metadata } from "next";

import { CatalogBrowser } from "@/components/products/CatalogBrowser";
import { CategoryCard } from "@/components/products/CategoryCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactBand } from "@/components/ui/ContactBand";
import { PageHero } from "@/components/ui/PageHero";
import { Eyebrow, SectionHeader } from "@/components/ui/Section";
import { getCategories, getCompany, getPage, getProducts } from "@/lib/content";
import { collectionLd, pageMetadata } from "@/lib/seo";
import { brandLabel, CATEGORY_HERO_PRODUCT } from "@/lib/site";

export const revalidate = 3600;

const PATH = "/products/";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(PATH);
  return pageMetadata({ title: page.title, description: page.description, path: PATH });
}

export default async function ProductsPage() {
  const [page, categories, products, company] = await Promise.all([getPage(PATH), getCategories(), getProducts(), getCompany()]);

  return (
    <>
      <JsonLd data={collectionLd({ name: page.h1, description: page.description, path: PATH, products })} />

      <PageHero
        compact
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Products", path: PATH },
        ]}
        eyebrow={<Eyebrow tone="dark">Products</Eyebrow>}
        title={page.h1}
        lede={
          <p>
            IP phones, VoIP gateways and IP PBX appliances from the brands we install every day. Everything is supplied,
            provisioned and supported by our team. There&rsquo;s no online checkout: request a quote and we confirm
            price and availability.
          </p>
        }
      />

      <section aria-labelledby="categories-title" className="py-16 lg:py-20">
        <div className="container-site">
          <h2 id="categories-title" className="sr-only">
            Product categories
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {categories.map((c, i) => {
              const inCat = products.filter((p) => p.category === c.slug);
              return (
                <CategoryCard
                  key={c.slug}
                  tone="light"
                  category={c}
                  index={i}
                  hero={inCat.find((p) => p.slug === CATEGORY_HERO_PRODUCT[c.slug]) ?? inCat[0]}
                  sample={inCat.slice(0, 4)}
                  brands={[...new Set(inCat.map(brandLabel))].slice(0, 3)}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="all-products-title" className="border-t border-line bg-paper-2/50 py-20 lg:py-28">
        <div className="container-site">
          <SectionHeader eyebrow="Catalog" id="all-products-title" title="Every model we list">
            Search by model or feature, or narrow by category, type and brand.
          </SectionHeader>
          <div className="mt-12">
            <CatalogBrowser
              products={products}
              categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            />
          </div>
        </div>
      </section>

      <ContactBand company={company} title="Not sure which model fits?" location="products_band" />
    </>
  );
}
