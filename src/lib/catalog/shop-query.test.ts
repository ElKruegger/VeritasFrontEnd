import { describe, expect, it } from "vitest";

import {
  parseShopQuery,
  type RawSearchParams,
  shopQueryString,
} from "@/lib/catalog/shop-query";

function toRaw(qs: string): RawSearchParams {
  const params = new URLSearchParams(qs);
  return Object.fromEntries(
    [...new Set(params.keys())].map((key) => [key, params.getAll(key)]),
  );
}

describe("parseShopQuery", () => {
  it("falls back to the defaults for an empty URL", () => {
    expect(parseShopQuery({})).toEqual({
      brand: null,
      sizes: [],
      inStock: false,
      sort: "newest",
      minPrice: null,
      maxPrice: null,
      page: 1,
    });
  });

  it("reads every filter from the URL", () => {
    const query = parseShopQuery({
      brand: "zegna",
      size: ["UK 8", "UK 9"],
      stock: "in",
      sort: "priceAsc",
      min: "200",
      max: "900",
      page: "3",
    });

    expect(query).toEqual({
      brand: "zegna",
      sizes: ["UK 8", "UK 9"],
      inStock: true,
      sort: "priceAsc",
      minPrice: 200,
      maxPrice: 900,
      page: 3,
    });
  });

  it("ignores an unknown sort, a bad page and a negative price", () => {
    const query = parseShopQuery({ sort: "cheapest", page: "-2", min: "-5" });

    expect(query.sort).toBe("newest");
    expect(query.page).toBe(1);
    expect(query.minPrice).toBeNull();
  });

  it("swaps a price range entered backwards", () => {
    const query = parseShopQuery({ min: "900", max: "200" });

    expect([query.minPrice, query.maxPrice]).toEqual([200, 900]);
  });

  it("drops duplicate, empty and oversized sizes and keeps at most 20", () => {
    const many = Array.from({ length: 30 }, (_, i) => `EU ${i}`);

    expect(parseShopQuery({ size: many }).sizes).toHaveLength(20);
    expect(
      parseShopQuery({ size: ["UK 8", "UK 8", " ", "x".repeat(51)] }).sizes,
    ).toEqual(["UK 8"]);
  });
});

describe("shopQueryString", () => {
  it("is empty when everything is at its default", () => {
    expect(shopQueryString(parseShopQuery({}))).toBe("");
  });

  it("round-trips through parseShopQuery", () => {
    const query = parseShopQuery({
      brand: "zegna",
      size: ["UK 8", "UK 9"],
      stock: "in",
      sort: "priceDesc",
      max: "900",
      page: "2",
    });

    expect(parseShopQuery(toRaw(shopQueryString(query)))).toEqual(query);
  });
});
