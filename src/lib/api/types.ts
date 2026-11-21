// Short names for the API's response shapes. Everything here comes from
// schema.d.ts, generated from the backend's OpenAPI document
// (`npm run api:sync`): when a DTO changes in the backend, the build breaks
// here instead of a page breaking in production.
import type { components } from "@/lib/api/schema";

type Schemas = components["schemas"];

export type Brand = Schemas["BrandDto"];
export type Category = Schemas["CategoryDto"];
export type Product = Schemas["ProductDto"];
export type ProductImage = Schemas["ProductImageDto"];
export type ProductVariant = Schemas["ProductVariantDto"];
export type ProductListItem = Schemas["ProductListItemDto"];
export type ProductPage = Schemas["PagedResultOfProductListItemDto"];
export type ProductFilters = Schemas["ProductFiltersDto"];
export type ProductSort = Schemas["ProductSort"];
