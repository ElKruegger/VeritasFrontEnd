"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

import type { ProductFilters, ProductSort } from "@/lib/api/types";
import {
  hasActiveFilters,
  parseShopQuery,
  type RawSearchParams,
  type ShopQuery,
  shopQueryString,
  sortOptions,
} from "@/lib/catalog/shop-query";
import { formatPrice } from "@/lib/format";

type FilterFormProps = {
  basePath: string;
  query: ShopQuery;
  filters: ProductFilters;
  defaultSort: ProductSort;
};

// A real <form method="get">: without JavaScript it still works (the browser
// submits it as a URL). With JavaScript, every change navigates straight to
// the new URL, built by shopQueryString so it stays short and canonical.
// Changing a filter drops the page number: page 3 of the old results means
// nothing for the new ones.
export function FilterForm({
  basePath,
  query,
  filters,
  defaultSort,
}: FilterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function apply(form: HTMLFormElement) {
    const data = new FormData(form);
    const raw: RawSearchParams = {};
    for (const key of new Set(data.keys())) {
      raw[key] = data.getAll(key).map(String);
    }
    const next = { ...parseShopQuery(raw, defaultSort), page: 1 };
    startTransition(() => {
      router.push(`${basePath}${shopQueryString(next, defaultSort)}`, {
        scroll: false,
      });
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    apply(event.currentTarget);
  }

  // Checkboxes, radios and the sort menu apply at once; the price fields
  // wait for Enter or the Apply button instead of firing on every keystroke.
  function onChange(event: FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement;
    if (target.type !== "number") apply(event.currentTarget);
  }

  const labelClass =
    "text-[11px] tracking-[var(--tracking-label)] text-stone uppercase";

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="filters"
        className="w-full border-y border-line py-3 text-left text-xs tracking-[var(--tracking-label)] uppercase lg:hidden"
      >
        {open ? "Close filters" : "Filter & sort"}
      </button>

      {/* Keyed by the URL: after "Clear filters" or the back button the
          inputs (uncontrolled) are rebuilt from the new query. */}
      <form
        key={shopQueryString(query, defaultSort)}
        id="filters"
        action={basePath}
        method="get"
        onSubmit={onSubmit}
        onChange={onChange}
        aria-busy={isPending}
        className={`${open ? "block" : "hidden"} space-y-9 pt-6 lg:block lg:pt-0`}
      >
        <div className="space-y-3">
          <label htmlFor="sort" className={`block ${labelClass}`}>
            Sort by
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={query.sort}
            className="w-full border border-line bg-paper px-3 py-2 text-sm"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {filters.brands.length > 1 && (
          <fieldset className="space-y-3">
            <legend className={`mb-3 ${labelClass}`}>Designer</legend>
            <Radio name="brand" value="" checked={query.brand === null}>
              All designers
            </Radio>
            {filters.brands.map((brand) => (
              <Radio
                key={brand.id}
                name="brand"
                value={brand.slug}
                checked={query.brand === brand.slug}
              >
                {brand.name}
              </Radio>
            ))}
          </fieldset>
        )}

        {filters.sizes.length > 0 && (
          <fieldset>
            <legend className={`mb-3 ${labelClass}`}>Size</legend>
            <div className="flex flex-wrap gap-2">
              {filters.sizes.map((size) => (
                <label
                  key={size}
                  className="cursor-pointer border border-line px-3 py-1.5 text-[13px] has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2"
                >
                  <input
                    type="checkbox"
                    name="size"
                    value={size}
                    defaultChecked={query.sizes.includes(size)}
                    className="sr-only"
                  />
                  {size}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="stock"
            value="in"
            defaultChecked={query.inStock}
            className="size-4 accent-ink"
          />
          In stock only
        </label>

        {filters.minPrice != null && filters.maxPrice != null && (
          <fieldset>
            <legend className={`mb-1 ${labelClass}`}>Price</legend>
            <p className="mb-3 text-xs text-stone">
              {formatPrice(filters.minPrice)} – {formatPrice(filters.maxPrice)}
            </p>
            <div className="flex items-end gap-3">
              <PriceInput
                name="min"
                label="Min"
                value={query.minPrice}
                placeholder={filters.minPrice}
              />
              <PriceInput
                name="max"
                label="Max"
                value={query.maxPrice}
                placeholder={filters.maxPrice}
              />
              <button
                type="submit"
                className="border border-ink px-3 py-2 text-xs tracking-[var(--tracking-label)] uppercase"
              >
                Apply
              </button>
            </div>
          </fieldset>
        )}

        {hasActiveFilters(query) && (
          <button
            type="button"
            onClick={() =>
              startTransition(() =>
                router.push(
                  `${basePath}${shopQueryString(
                    { ...parseShopQuery({}, defaultSort), sort: query.sort },
                    defaultSort,
                  )}`,
                  { scroll: false },
                ),
              )
            }
            className="text-[13px] underline underline-offset-[6px]"
          >
            Clear filters
          </button>
        )}
      </form>
    </div>
  );
}

function Radio({
  name,
  value,
  checked,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={checked}
        className="size-4 accent-ink"
      />
      {children}
    </label>
  );
}

function PriceInput({
  name,
  label,
  value,
  placeholder,
}: {
  name: string;
  label: string;
  value: number | null;
  placeholder: number;
}) {
  return (
    <label className="block flex-1 text-xs text-stone">
      {label}
      <input
        type="number"
        name={name}
        min={0}
        step={1}
        inputMode="numeric"
        defaultValue={value ?? undefined}
        placeholder={String(Math.round(placeholder))}
        className="mt-1 block w-full border border-line bg-paper px-3 py-2 text-sm text-ink"
      />
    </label>
  );
}
