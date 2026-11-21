import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { FilterForm } from "@/components/catalog/filter-form";
import { Pagination } from "@/components/catalog/pagination";
import {
  ProductGrid,
  ProductGridSkeleton,
} from "@/components/product/product-grid";
import {
  getCategoryBySlug,
  getProductFilters,
  getProducts,
} from "@/lib/api/catalog";
import type { ProductFilters, ProductPage, ProductSort } from "@/lib/api/types";
import {
  hasActiveFilters,
  PAGE_SIZE,
  parseShopQuery,
  type RawSearchParams,
  type ShopQuery,
  shopQueryString,
} from "@/lib/catalog/shop-query";
import { type Collection, collections, findCollection } from "@/lib/navigation";

const DEFAULT_SORT: ProductSort = "newest";

// The collections are a fixed list, so each page's shell (heading,
// layout) is prerendered at build time. The products depend on the
// filters in the URL and stream in at request time.
export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const collection = findCollection((await params).slug);
  if (!collection) return {};
  return {
    title: collection.label,
    description: collection.note,
    alternates: { canonical: `/shop/${collection.slug}` },
  };
}

// params is read inside Suspense: for the listed collections it is known
// at build time, so the heading is still part of the prerendered shell; for
// any other slug the navigation stays instant and shows the skeleton first.
export default function ShopPage({
  params,
  searchParams,
}: PageProps<"/shop/[slug]">) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-12 pb-24 md:px-10 md:pt-16">
      <Suspense fallback={<HeaderSkeleton />}>
        {params.then(({ slug }) => (
          <CollectionHeader slug={slug} />
        ))}
      </Suspense>

      <Suspense fallback={<ListingSkeleton />}>
        {params.then(({ slug }) => {
          const collection = findCollection(slug);
          // Unknown slugs: CollectionHeader renders the 404.
          return collection ? (
            <Listing collection={collection} searchParams={searchParams} />
          ) : null;
        })}
      </Suspense>
    </div>
  );
}

function CollectionHeader({ slug }: { slug: string }) {
  const collection = findCollection(slug);
  if (!collection) notFound();

  return (
    <header className="max-w-2xl">
      <h1 className="font-display text-[44px] leading-none md:text-[64px]">
        {collection.label}
      </h1>
      <p className="mt-5 text-[15px] leading-relaxed text-stone">
        {collection.note}
      </p>
    </header>
  );
}

function HeaderSkeleton() {
  return (
    <div aria-hidden className="max-w-2xl space-y-5">
      <div className="h-11 w-64 bg-mist md:h-16" />
      <div className="h-4 w-96 max-w-full bg-mist" />
    </div>
  );
}

async function Listing({
  collection,
  searchParams,
}: {
  collection: Collection;
  searchParams: Promise<RawSearchParams>;
}) {
  const query = parseShopQuery(await searchParams, DEFAULT_SORT);
  const basePath = `/shop/${collection.slug}`;

  let data: { filters: ProductFilters; page: ProductPage } | "missing";
  try {
    data = await load(collection, query);
  } catch {
    return (
      <p className="mt-16 border-t border-line pt-10 text-sm text-stone">
        This collection is unavailable right now. Please try again in a moment.
      </p>
    );
  }
  if (data === "missing") notFound();
  const { filters, page } = data;

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
      <aside aria-label="Filters">
        <FilterForm
          basePath={basePath}
          query={query}
          filters={filters}
          defaultSort={DEFAULT_SORT}
        />
      </aside>

      <section aria-label="Products">
        <p
          className="mb-8 border-b border-line pb-4 text-[13px] text-stone"
          aria-live="polite"
        >
          {page.totalCount === 1 ? "1 piece" : `${page.totalCount} pieces`}
        </p>

        {page.items.length > 0 ? (
          <>
            <ProductGrid products={page.items} />
            <Pagination
              page={query.page}
              totalPages={page.totalPages}
              href={(p) =>
                `${basePath}${shopQueryString({ ...query, page: p }, DEFAULT_SORT)}`
              }
            />
          </>
        ) : (
          <EmptyState basePath={basePath} query={query} />
        )}
      </section>
    </div>
  );
}

async function load(collection: Collection, query: ShopQuery) {
  const category = collection.categorySlug
    ? await getCategoryBySlug(collection.categorySlug)
    : null;
  if (collection.categorySlug && !category) return "missing" as const;

  const filters = await getProductFilters({ CategoryId: category?.id });
  // An unknown designer in the URL (renamed, mistyped) is ignored rather
  // than showing an empty page.
  const brand = query.brand
    ? filters.brands.find((b) => b.slug === query.brand)
    : undefined;

  const page = await getProducts({
    CategoryId: category?.id,
    BrandId: brand?.id,
    Sizes: query.sizes.length > 0 ? query.sizes : undefined,
    InStock: query.inStock || undefined,
    MinPrice: query.minPrice ?? undefined,
    MaxPrice: query.maxPrice ?? undefined,
    Sort: query.sort,
    PageNumber: query.page,
    PageSize: PAGE_SIZE,
  });

  return { filters, page };
}

function EmptyState({
  basePath,
  query,
}: {
  basePath: string;
  query: ShopQuery;
}) {
  const filtered = hasActiveFilters(query);
  return (
    <div className="py-16">
      <p className="font-display text-2xl">
        {filtered
          ? "Nothing matches these filters."
          : query.page > 1
            ? "There is nothing on this page."
            : "This collection is empty for now."}
      </p>
      {(filtered || query.page > 1) && (
        <Link
          href={basePath}
          className="mt-6 inline-block text-[13px] underline underline-offset-[6px]"
        >
          {filtered ? "Clear filters" : "Back to the first page"}
        </Link>
      )}
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
      <div aria-hidden className="hidden space-y-4 lg:block">
        <div className="h-3 w-1/2 bg-mist" />
        <div className="h-9 bg-mist" />
        <div className="h-3 w-2/3 bg-mist" />
      </div>
      <div>
        <div className="mb-8 h-4 border-b border-line pb-4" />
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
