import { describe, expect, it } from "vitest";

import { safeNextPath, withNext } from "./next-path";

describe("safeNextPath", () => {
  it("keeps paths on this site", () => {
    expect(safeNextPath("/product/oxford-shoe")).toBe("/product/oxford-shoe");
    expect(safeNextPath("/shop/watches?sort=priceAsc")).toBe(
      "/shop/watches?sort=priceAsc",
    );
    expect(safeNextPath(["/bag", "/other"])).toBe("/bag");
  });

  it.each([
    undefined,
    "",
    "account",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\t/evil.example",
    "javascript:alert(1)",
  ])("falls back to the account page for %j", (value) => {
    expect(safeNextPath(value)).toBe("/account");
  });
});

describe("withNext", () => {
  it("only adds ?next= when it leads somewhere else than the account page", () => {
    expect(withNext("/account/login", "/account")).toBe("/account/login");
    expect(withNext("/account/login", "/shop/new?page=2")).toBe(
      "/account/login?next=%2Fshop%2Fnew%3Fpage%3D2",
    );
  });
});
