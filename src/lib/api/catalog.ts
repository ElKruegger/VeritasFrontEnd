// Catalog reads used by the pages. Each one is cached on the Next.js server
// ("use cache"): the arguments are the cache key, so the product page's
// metadata and body share one API call, and a popular category page is
// served from cache instead of hitting the API on every visit. Lifetimes
// are short because stock changes; the bag and checkout will always read live.
import { cacheLife } from "next/cache";

import type { paths } from "@/lib/api/schema";
import { api, ApiError, unwrap } from "@/lib/api/server";
import type { Category, Product } from "@/lib/api/types";

export type ProductQuery = NonNullable<
  paths["/api/v1/Products"]["get"]["parameters"]["query"]
>;
export type ProductFilterQuery = NonNullable<
  paths["/api/v1/Products/filters"]["get"]["parameters"]["query"]
>;

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  return unwrap(api.GET("/api/v1/Categories"));
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getProducts(query: ProductQuery) {
  "use cache";
  cacheLife("minutes");
  return unwrap(api.GET("/api/v1/Products", { params: { query } }));
}

export async function getProductFilters(query: ProductFilterQuery) {
  "use cache";
  cacheLife("minutes");
  return unwrap(api.GET("/api/v1/Products/filters", { params: { query } }));
}

/** The product, or null when no active product has this slug. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("minutes");
  try {
    return await unwrap(
      api.GET("/api/v1/Products/slug/{slug}", { params: { path: { slug } } }),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getRelatedProducts(productId: string, limit = 4) {
  "use cache";
  cacheLife("minutes");
  return unwrap(
    api.GET("/api/v1/Products/{id}/related", {
      params: { path: { id: productId }, query: { Limit: limit } },
    }),
  );
}
