// Response shapes of the Véritas API used by the storefront.
//
// Temporary and hand-written: roadmap step 2 replaces this file with types
// generated from the backend's OpenAPI document, so a contract change
// breaks the build instead of a page.

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  brandName: string;
  categoryName: string;
  primaryImageUrl: string | null;
  primaryImageAltText: string | null;
  inStock: boolean;
};

export type PagedResult<T> = {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
};

export type ProductFilters = {
  brands: Brand[];
  sizes: string[];
  minPrice: number | null;
  maxPrice: number | null;
};
