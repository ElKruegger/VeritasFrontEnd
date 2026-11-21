import { describe, expect, it } from "vitest";

import { siteUrl } from "./site-url";

describe("siteUrl", () => {
  it("uses SITE_URL first", () => {
    expect(
      siteUrl({
        SITE_URL: "https://veritas.example",
        VERCEL_PROJECT_PRODUCTION_URL: "veritas.vercel.app",
      }).href,
    ).toBe("https://veritas.example/");
  });

  it("falls back to the Vercel production domain, over HTTPS", () => {
    expect(
      siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "veritas.vercel.app" }).href,
    ).toBe("https://veritas.vercel.app/");
  });

  it("is localhost in development", () => {
    expect(siteUrl({}).href).toBe("http://localhost:3000/");
  });
});
