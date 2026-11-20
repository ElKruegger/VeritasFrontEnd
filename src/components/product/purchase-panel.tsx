"use client";

import { useId, useState } from "react";

import type { ProductVariant } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";

const LOW_STOCK = 3;

type PurchasePanelProps = {
  basePrice: number;
  variants: ProductVariant[];
};

// The only interactive part of the product page: choosing a size. Price
// and stock come from the API; the bag will re-read both on the server
// when it exists, so nothing chosen here is trusted.
export function PurchasePanel({ basePrice, variants }: PurchasePanelProps) {
  const available = variants.filter((v) => v.isActive);
  const [selectedId, setSelectedId] = useState<string | null>(
    available.length === 1 && available[0].stockQuantity > 0
      ? available[0].id
      : null,
  );
  const legendId = useId();

  const selected = available.find((v) => v.id === selectedId) ?? null;
  const soldOut = available.every((v) => v.stockQuantity <= 0);

  return (
    <div>
      <p className="text-lg">
        <PriceLabel
          basePrice={basePrice}
          variants={available}
          selected={selected}
        />
      </p>

      {available.length > 0 && (
        <fieldset className="mt-10" aria-describedby={`${legendId}-note`}>
          <legend
            id={legendId}
            className="mb-3 text-[11px] tracking-[var(--tracking-label)] text-stone uppercase"
          >
            Size
          </legend>
          <div className="flex flex-wrap gap-2">
            {available.map((variant) => {
              const out = variant.stockQuantity <= 0;
              return (
                <label
                  key={variant.id}
                  className={`border px-4 py-2.5 text-[13px] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${
                    out
                      ? "cursor-not-allowed border-line text-stone/60 line-through"
                      : "cursor-pointer border-line hover:border-ink has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper"
                  }`}
                >
                  <input
                    type="radio"
                    name="variant"
                    value={variant.id}
                    disabled={out}
                    checked={selectedId === variant.id}
                    onChange={() => setSelectedId(variant.id)}
                    className="sr-only"
                  />
                  {variant.variantLabel}
                  {out && <span className="sr-only"> (sold out)</span>}
                </label>
              );
            })}
          </div>
          <p
            id={`${legendId}-note`}
            className="mt-3 min-h-5 text-xs text-stone"
            aria-live="polite"
          >
            {selected &&
              selected.stockQuantity <= LOW_STOCK &&
              `Only ${selected.stockQuantity} left in ${selected.variantLabel}.`}
          </p>
        </fieldset>
      )}

      {/* Disabled until the bag exists (roadmap step 5). */}
      <button
        type="button"
        disabled
        className="mt-6 w-full bg-ink py-4 text-xs tracking-[var(--tracking-label)] text-paper uppercase disabled:cursor-not-allowed disabled:opacity-60"
      >
        {soldOut ? "Sold out" : selected ? "Add to bag" : "Select a size"}
      </button>
      <p className="mt-3 text-xs text-stone">
        The bag is not open yet: this demo store does not take orders.
      </p>
    </div>
  );
}

function PriceLabel({
  basePrice,
  variants,
  selected,
}: {
  basePrice: number;
  variants: ProductVariant[];
  selected: ProductVariant | null;
}) {
  if (selected) return <>{formatPrice(selected.effectivePrice)}</>;

  const prices = variants.map((v) => v.effectivePrice);
  if (prices.length === 0) return <>{formatPrice(basePrice)}</>;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? (
    <>{formatPrice(min)}</>
  ) : (
    <>
      {formatPrice(min)} – {formatPrice(max)}
    </>
  );
}
