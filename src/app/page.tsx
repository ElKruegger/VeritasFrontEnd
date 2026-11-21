import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { ProductCard } from "@/components/product/product-card";
import { getProductFilters, getProducts } from "@/lib/api/catalog";
import type { ProductFilters, ProductListItem } from "@/lib/api/types";
import { departmentHref, departments } from "@/lib/navigation";

export default function HomePage() {
  return (
    <>
      <section className="mx-auto grid max-w-[1440px] gap-14 px-4 pt-14 pb-20 md:grid-cols-12 md:px-10 md:pt-24">
        <div className="md:col-span-6">
          <p className="text-[11px] tracking-[var(--tracking-label)] text-stone uppercase">
            Autumn / Winter 2026
          </p>
          <h1 className="mt-6 font-display text-[52px] leading-[0.95] md:text-[88px]">
            The Winter
            <br />
            <em className="italic">Edit</em>
          </h1>
          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-stone">
            Cashmere overcoats from Zegna, Goodyear-welted shoes from Crockett
            &amp; Jones and mechanical watches meant to be worn for decades, not
            seasons.
          </p>
          <Link
            href={departmentHref("clothing")}
            className="mt-10 inline-block border-b border-current pb-1 text-[13px] tracking-[var(--tracking-label)] uppercase decoration-ink/40"
          >
            Shop the edit
          </Link>
        </div>

        <nav aria-label="Departments" className="md:col-span-5 md:col-start-8">
          <ol className="border-t border-line">
            {departments.map((d, index) => (
              <li key={d.slug} className="border-b border-line">
                <Link
                  href={departmentHref(d.slug)}
                  className="group grid grid-cols-[2.5rem_1fr] gap-x-4 py-5"
                >
                  <span className="pt-2 text-xs text-stone tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="font-display text-3xl transition-[font-style] group-hover:italic">
                      {d.label}
                    </span>
                    <span className="mt-1 block text-sm text-stone">
                      {d.note}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      <section
        aria-labelledby="new-arrivals"
        className="mx-auto max-w-[1440px] px-4 md:px-10"
      >
        <div className="flex items-baseline justify-between border-t border-line pt-6">
          <h2 id="new-arrivals" className="font-display text-3xl md:text-4xl">
            New arrivals
          </h2>
          <Link
            href={departmentHref("new")}
            className="text-[13px] underline-offset-[6px] hover:underline"
          >
            View all
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <NewArrivals />
        </Suspense>
      </section>

      <section
        aria-labelledby="houses"
        className="mx-auto mt-28 max-w-[1440px] px-4 md:px-10"
      >
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2
              id="houses"
              className="text-[11px] tracking-[var(--tracking-label)] text-stone uppercase"
            >
              The houses
            </h2>
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              From Northampton shoemakers to Geneva watchmakers: makers who
              still build things to be repaired rather than replaced.
            </p>
          </div>
          <Suspense fallback={<div className="md:col-span-8" />}>
            <Houses />
          </Suspense>
        </div>
      </section>
    </>
  );
}

// Product data streams in at request time (see the Suspense boundaries
// above): the rest of the page is prerendered and served instantly.
// connection() keeps these reads out of the build: the API is not reachable
// from CI, and a Render cold start during a deploy must not bake "unavailable"
// into the prerendered page. The reads themselves are cached (lib/api/catalog).
async function NewArrivals() {
  await connection();
  let products: ProductListItem[];
  try {
    const page = await getProducts({ Sort: "newest", PageSize: 4 });
    products = page.items;
  } catch {
    return (
      <p className="py-16 text-sm text-stone">
        New arrivals are unavailable right now.
      </p>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 2} />
      ))}
    </div>
  );
}

async function Houses() {
  await connection();
  let filters: ProductFilters;
  try {
    filters = await getProductFilters({});
  } catch {
    return null;
  }

  return (
    <ul className="flex flex-wrap gap-x-8 gap-y-3 font-display text-3xl leading-tight md:col-span-8 md:text-[42px]">
      {filters.brands.map((brand) => (
        <li key={brand.id}>{brand.name}</li>
      ))}
    </ul>
  );
}

function ProductGridSkeleton({ count }: { count: number }) {
  return (
    <div
      aria-hidden
      className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="aspect-[4/5] animate-pulse bg-mist" />
          <div className="mt-4 h-3 w-1/3 bg-mist" />
          <div className="mt-2 h-3 w-2/3 bg-mist" />
        </div>
      ))}
    </div>
  );
}
