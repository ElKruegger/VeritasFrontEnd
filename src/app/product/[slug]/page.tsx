import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductGallery } from "@/components/product/product-gallery";
import {
  ProductGrid,
  ProductGridSkeleton,
} from "@/components/product/product-grid";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { getProductBySlug, getRelatedProducts } from "@/lib/api/catalog";
import type { Product } from "@/lib/api/types";
import { departmentLabel } from "@/lib/navigation";

// Products are not listed at build time (the build doesn't call the API):
// the layout is prerendered and the product streams in on the first
// request, then comes from the cache (lib/api/catalog).

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug).catch(() => null);
  if (!product) return { title: "Product not found" };

  const title = `${product.brand.name} ${product.name}`;
  const image = product.images.find((i) => i.variantId == null);
  return {
    title,
    description: product.description ?? undefined,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description: product.description ?? undefined,
      images:
        image && !image.url.includes("placehold.co")
          ? [{ url: image.url, alt: image.altText }]
          : undefined,
    },
  };
}

export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      {params.then(({ slug }) => (
        <ProductView slug={slug} />
      ))}
    </Suspense>
  );
}

async function ProductView({ slug }: { slug: string }) {
  let product: Product | null;
  try {
    product = await getProductBySlug(slug);
  } catch {
    return (
      <p className="mx-auto max-w-[1440px] px-4 py-24 text-sm text-stone md:px-10">
        This product is unavailable right now. Please try again in a moment.
      </p>
    );
  }
  if (!product) notFound();

  const department =
    departmentLabel(product.category.slug) ?? product.category.name;

  return (
    <>
      <ProductJsonLd product={product} />

      <div className="mx-auto max-w-[1440px] px-4 pt-6 pb-24 md:px-10">
        <nav aria-label="Breadcrumb" className="text-xs text-stone">
          <ol className="flex gap-2">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href={`/shop/${product.category.slug}`}
                className="hover:underline"
              >
                {department}
              </Link>
            </li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.images}
              brandName={product.brand.name}
              productName={product.name}
            />
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-10">
              <p className="text-[12px] font-medium tracking-[var(--tracking-label)] uppercase">
                {product.brand.name}
              </p>
              <h1 className="mt-3 font-display text-[34px] leading-tight md:text-[42px]">
                {product.name}
              </h1>

              <div className="mt-6">
                <PurchasePanel
                  basePrice={product.basePrice}
                  variants={product.variants}
                />
              </div>

              {product.description && (
                <div className="mt-12 border-t border-line pt-8">
                  <h2 className="text-[11px] tracking-[var(--tracking-label)] text-stone uppercase">
                    Details
                  </h2>
                  <p className="mt-4 text-[15px] leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <dl className="mt-8 space-y-2 border-t border-line pt-8 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-stone">Shipping</dt>
                  <dd>Complimentary over $500</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone">Returns</dt>
                  <dd>Within 30 days</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <section aria-labelledby="related" className="mt-28">
          <h2
            id="related"
            className="border-t border-line pt-6 font-display text-3xl md:text-4xl"
          >
            Related pieces
          </h2>
          <div className="mt-8">
            <Suspense fallback={<ProductGridSkeleton count={4} />}>
              <Related productId={product.id} />
            </Suspense>
          </div>
        </section>
      </div>
    </>
  );
}

async function Related({ productId }: { productId: string }) {
  const products = await getRelatedProducts(productId, 4).catch(() => []);
  if (products.length === 0) {
    return <p className="text-sm text-stone">Nothing related yet.</p>;
  }
  return <ProductGrid products={products} priorityCount={0} />;
}

// schema.org Product data: lets search engines show price and
// availability in results. "<" is escaped so a product text can never
// close the script tag.
function ProductJsonLd({ product }: { product: Product }) {
  const variants = product.variants.filter((v) => v.isActive);
  const prices = variants.map((v) => v.effectivePrice);
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    brand: { "@type": "Brand", name: product.brand.name },
    sku: variants[0]?.sku,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: prices.length ? Math.min(...prices) : product.basePrice,
      highPrice: prices.length ? Math.max(...prices) : product.basePrice,
      availability: variants.some((v) => v.stockQuantity > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

function ProductSkeleton() {
  return (
    <div
      aria-hidden
      className="mx-auto grid max-w-[1440px] gap-10 px-4 pt-14 pb-24 md:px-10 lg:grid-cols-12 lg:gap-16"
    >
      <div className="aspect-[4/5] animate-pulse bg-mist lg:col-span-7" />
      <div className="space-y-4 lg:col-span-5">
        <div className="h-3 w-24 bg-mist" />
        <div className="h-9 w-3/4 bg-mist" />
        <div className="h-5 w-20 bg-mist" />
      </div>
    </div>
  );
}
