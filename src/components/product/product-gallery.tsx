import { ProductImage } from "@/components/product/product-image";
import type { ProductImage as Image } from "@/lib/api/types";

// The product's general images (variant-specific ones will follow the size
// picker once a product has them). A swipeable row on mobile, a two-column
// grid from md up, the lead image at full width.
export function ProductGallery({
  images,
  brandName,
  productName,
}: {
  images: Image[];
  brandName: string;
  productName: string;
}) {
  const shown = images
    .filter((image) => image.variantId == null)
    .toSorted((a, b) => a.sortOrder - b.sortOrder);

  if (shown.length === 0) {
    return (
      <div className="relative aspect-[4/5] bg-mist">
        <ProductImage
          src={null}
          alt={productName}
          brandName={brandName}
          sizes="(min-width: 1024px) 55vw, 100vw"
          priority
        />
      </div>
    );
  }

  return (
    <ul
      aria-label="Product images"
      className="-mx-4 flex snap-x snap-mandatory [scrollbar-width:none] gap-2 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:px-0"
    >
      {shown.map((image, index) => (
        <li
          key={image.id}
          className={`relative aspect-[4/5] w-[85%] shrink-0 snap-start bg-mist md:w-auto ${
            index === 0 ? "md:col-span-2" : ""
          }`}
        >
          <ProductImage
            src={image.url}
            alt={image.altText}
            brandName={brandName}
            sizes={
              index === 0
                ? "(min-width: 1024px) 55vw, 85vw"
                : "(min-width: 1024px) 27vw, 85vw"
            }
            priority={index === 0}
          />
        </li>
      ))}
    </ul>
  );
}
