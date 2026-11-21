import type { Metadata } from "next";
import Form from "next/form";
import { Suspense } from "react";

import { Pagination } from "@/components/catalog/pagination";
import {
  ProductGrid,
  ProductGridSkeleton,
} from "@/components/product/product-grid";
import { getProducts } from "@/lib/api/catalog";
import type { ProductPage } from "@/lib/api/types";
import { PAGE_SIZE, parseShopQuery } from "@/lib/catalog/shop-query";

// Result pages are not worth indexing: every query is a different URL.
export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

const MAX_QUERY_LENGTH = 100; // = the API's limit

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-12 pb-24 md:px-10 md:pt-16">
      <h1 className="font-display text-[44px] leading-none md:text-[64px]">
        Search
      </h1>

      {/* The box needs the query too (to show it), so it renders inside the
          boundary; the fallback is a plain, non-interactive copy of it. */}
      <Suspense fallback={<SearchBoxPlaceholder />}>
        {searchParams.then((params) => {
          const q = readQuery(params.q);
          const page = parseShopQuery(params).page;
          return (
            <>
              <SearchBox defaultValue={q} />
              <Suspense key={`${q}:${page}`} fallback={<ResultsSkeleton />}>
                <Results q={q} page={page} />
              </Suspense>
            </>
          );
        })}
      </Suspense>
    </div>
  );
}

function SearchBoxPlaceholder() {
  return (
    <div aria-hidden className="mt-10 max-w-2xl border-b border-ink py-3">
      <span className="text-lg text-stone">Product or designer</span>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="mt-12">
      <div className="mb-8 h-4 border-b border-line pb-4" />
      <ProductGridSkeleton />
    </div>
  );
}

function readQuery(value: string | string[] | undefined): string {
  const q = Array.isArray(value) ? value[0] : value;
  return (q ?? "").trim().slice(0, MAX_QUERY_LENGTH);
}

// next/form: a GET form that navigates on the client (no full reload)
// and still works as a plain form without JavaScript.
function SearchBox({ defaultValue }: { defaultValue: string }) {
  return (
    <Form action="/search" className="mt-10 flex max-w-2xl gap-3">
      <label htmlFor="q" className="sr-only">
        Search by product or designer
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        maxLength={MAX_QUERY_LENGTH}
        placeholder="Product or designer"
        autoComplete="off"
        className="flex-1 border-b border-ink bg-transparent py-3 text-lg outline-offset-4 placeholder:text-stone"
      />
      <button
        type="submit"
        className="px-2 text-xs tracking-[var(--tracking-label)] uppercase"
      >
        Search
      </button>
    </Form>
  );
}

async function Results({ q, page }: { q: string; page: number }) {
  if (!q) return null;

  let results: ProductPage;
  try {
    results = await getProducts({
      Search: q,
      Sort: "name",
      PageNumber: page,
      PageSize: PAGE_SIZE,
    });
  } catch {
    return (
      <p className="mt-12 text-sm text-stone">
        Search is unavailable right now. Please try again in a moment.
      </p>
    );
  }

  return (
    <section aria-label="Search results" className="mt-12">
      <p
        className="mb-8 border-b border-line pb-4 text-[13px] text-stone"
        aria-live="polite"
      >
        {results.totalCount === 0
          ? `Nothing found for “${q}”.`
          : `${results.totalCount} ${results.totalCount === 1 ? "result" : "results"} for “${q}”`}
      </p>
      {results.items.length > 0 && (
        <>
          <ProductGrid products={results.items} />
          <Pagination
            page={page}
            totalPages={results.totalPages}
            href={(p) =>
              `/search?${new URLSearchParams(
                p > 1 ? { q, page: String(p) } : { q },
              )}`
            }
          />
        </>
      )}
    </section>
  );
}
