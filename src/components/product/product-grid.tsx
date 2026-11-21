import { ProductCard } from "@/components/product/product-card";
import type { ProductListItem } from "@/lib/api/types";

const gridClass =
  "grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4";

export function ProductGrid({
  products,
  priorityCount = 2,
}: {
  products: ProductListItem[];
  /** How many cards load their image eagerly (the first row on mobile). */
  priorityCount?: number;
}) {
  return (
    <ul className={gridClass}>
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div aria-hidden className={gridClass}>
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
