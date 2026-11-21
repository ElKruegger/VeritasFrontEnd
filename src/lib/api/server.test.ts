import { describe, expect, it } from "vitest";

import { apiTimeoutMs } from "./server";

describe("apiTimeoutMs", () => {
  it("defaults to 10 seconds", () => {
    expect(apiTimeoutMs(undefined)).toBe(10_000);
  });

  it("takes a positive whole number of milliseconds from the environment", () => {
    expect(apiTimeoutMs("45000")).toBe(45_000);
  });

  it.each(["", "abc", "0", "-5", "1.5"])("ignores %j", (value) => {
    expect(apiTimeoutMs(value)).toBe(10_000);
  });
});
