import Link from "next/link";

import { ProductImage } from "@/components/product/product-image";
import type { ProductListItem } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";

type ProductCardProps = {
  product: ProductListItem;
  /** Load eagerly: only for cards visible without scrolling. */
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <article className="group">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-mist">
          <ProductImage
            src={product.primaryImageUrl}
            alt={product.primaryImageAltText ?? product.name}
            brandName={product.brandName}
            priority={priority}
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
          {!product.inStock && (
            <span className="absolute top-3 left-3 bg-paper px-2 py-1 text-[10px] tracking-[var(--tracking-label)] uppercase">
              Sold out
            </span>
          )}
        </div>

        <div className="mt-4 space-y-1">
          <p className="text-[11px] font-medium tracking-[var(--tracking-label)] uppercase">
            {product.brandName}
          </p>
          <h3 className="text-sm text-stone">{product.name}</h3>
          <p className="text-sm">{formatPrice(product.basePrice)}</p>
        </div>
      </Link>
    </article>
  );
}
