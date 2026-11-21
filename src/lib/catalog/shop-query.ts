// The state of a listing page (filters, sort, page) lives in the URL, so a
// filtered page can be shared, bookmarked and reloaded, and the back button
// undoes the last filter. This module is the only place that knows the URL
// format: /shop/clothing?brand=zegna&size=UK+8&size=UK+9&stock=in&sort=priceAsc&min=200&max=900&page=2
import type { ProductSort } from "@/lib/api/types";

export const PAGE_SIZE = 24;

export const sortOptions: ReadonlyArray<{ value: ProductSort; label: string }> =
  [
    { value: "newest", label: "New in" },
    { value: "priceAsc", label: "Price: low to high" },
    { value: "priceDesc", label: "Price: high to low" },
    { value: "name", label: "A–Z" },
  ];

export type ShopQuery = {
  brand: string | null;
  sizes: string[];
  inStock: boolean;
  sort: ProductSort;
  minPrice: number | null;
  maxPrice: number | null;
  page: number;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

// Same limits as the API (ProductQueryParamsValidator): a crafted URL
// becomes a sensible page instead of a 400 from the API.
const MAX_SIZES = 20;
const MAX_SIZE_LENGTH = 50;

function all(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function first(value: string | string[] | undefined): string | undefined {
  return all(value)[0];
}

function price(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function isSort(value: string | undefined): value is ProductSort {
  return sortOptions.some((o) => o.value === value);
}

export function parseShopQuery(
  params: RawSearchParams,
  defaultSort: ProductSort = "newest",
): ShopQuery {
  const sort = first(params.sort);
  const page = Number(first(params.page));
  let minPrice = price(first(params.min));
  let maxPrice = price(first(params.max));
  if (minPrice !== null && maxPrice !== null && maxPrice < minPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  const sizes = [
    ...new Set(
      all(params.size)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length <= MAX_SIZE_LENGTH),
    ),
  ].slice(0, MAX_SIZES);

  return {
    brand: first(params.brand)?.trim() || null,
    sizes,
    inStock: first(params.stock) === "in",
    sort: isSort(sort) ? sort : defaultSort,
    minPrice,
    maxPrice,
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

/** The query string for a ShopQuery ("" when everything is at its default). */
export function shopQueryString(
  query: ShopQuery,
  defaultSort: ProductSort = "newest",
): string {
  const params = new URLSearchParams();
  if (query.brand) params.set("brand", query.brand);
  for (const size of query.sizes) params.append("size", size);
  if (query.inStock) params.set("stock", "in");
  if (query.sort !== defaultSort) params.set("sort", query.sort);
  if (query.minPrice !== null) params.set("min", String(query.minPrice));
  if (query.maxPrice !== null) params.set("max", String(query.maxPrice));
  if (query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function hasActiveFilters(query: ShopQuery): boolean {
  return (
    query.brand !== null ||
    query.sizes.length > 0 ||
    query.inStock ||
    query.minPrice !== null ||
    query.maxPrice !== null
  );
}
