import Image from "next/image";

type ProductImageProps = {
  src: string | null;
  alt: string;
  brandName: string;
  sizes: string;
  priority?: boolean;
};

// The API answers with a placehold.co URL for products that have no
// photography uploaded yet. Those images carry their alt text in a tiny
// font and read as broken, so they are replaced here by a quiet tile with
// the brand's initial. Delete this check once real photos are in storage.
function isPlaceholder(src: string): boolean {
  try {
    return new URL(src).hostname === "placehold.co";
  } catch {
    return true;
  }
}

export function ProductImage({
  src,
  alt,
  brandName,
  sizes,
  priority = false,
}: ProductImageProps) {
  if (!src || isPlaceholder(src)) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 flex items-center justify-center bg-mist"
      >
        <span
          aria-hidden
          className="font-display text-[7rem] leading-none text-ink/15 italic select-none"
        >
          {brandName.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
    />
  );
}
