// The storefront's departments. Slugs match the API's category slugs; the
// labels are the storefront's wording (the API calls fragrance "Perfumes").
// Kept static so the header and the department pages' headings render
// without waiting for the API.
export const departments = [
  {
    slug: "clothing",
    label: "Clothing",
    note: "Tailoring, shirting and knitwear in wool, linen and cashmere.",
  },
  {
    slug: "footwear",
    label: "Footwear",
    note: "Goodyear-welted Oxfords and loafers, made to be resoled.",
  },
  {
    slug: "watches",
    label: "Watches",
    note: "Mechanical movements from Swiss and Japanese maisons.",
  },
  {
    slug: "accessories",
    label: "Accessories",
    note: "Leather goods, eyewear and the finishing details.",
  },
  {
    slug: "perfumes",
    label: "Fragrance",
    note: "Signature fragrances, from fresh citrus to deep oud.",
  },
  {
    slug: "outlet",
    label: "Outlet",
    note: "Previous-season pieces at reduced prices, while sizes last.",
  },
] as const;

export type Department = (typeof departments)[number];

/**
 * What /shop/[slug] can show: a department (one API category), or "new",
 * every department sorted by arrival.
 */
export type Collection = {
  slug: string;
  label: string;
  note: string;
  /** The API category slug; null for a collection across all categories. */
  categorySlug: string | null;
};

export const collections: readonly Collection[] = [
  {
    slug: "new",
    label: "New arrivals",
    note: "The latest pieces across every department.",
    categorySlug: null,
  },
  ...departments.map((d) => ({ ...d, categorySlug: d.slug })),
];

export function findCollection(slug: string): Collection | null {
  return collections.find((c) => c.slug === slug) ?? null;
}

export function departmentHref(slug: Department["slug"] | "new"): string {
  return `/shop/${slug}`;
}

/** The department label for an API category slug ("perfumes" → "Fragrance"). */
export function departmentLabel(categorySlug: string): string | null {
  return departments.find((d) => d.slug === categorySlug)?.label ?? null;
}
