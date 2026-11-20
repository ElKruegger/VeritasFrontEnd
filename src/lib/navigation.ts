// The storefront's departments. Slugs match the API's category slugs; the
// labels are the storefront's wording (the API calls fragrance "Perfumes").
// Kept static so the header renders without waiting for the API.
export const departments = [
  { slug: "clothing", label: "Clothing" },
  { slug: "footwear", label: "Footwear" },
  { slug: "watches", label: "Watches" },
  { slug: "accessories", label: "Accessories" },
  { slug: "perfumes", label: "Fragrance" },
  { slug: "outlet", label: "Outlet" },
] as const;

export type Department = (typeof departments)[number];

export function departmentHref(slug: Department["slug"]): string {
  return `/shop/${slug}`;
}
