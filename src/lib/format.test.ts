import { describe, expect, it } from "vitest";

import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("shows whole amounts without cents", () => {
    expect(formatPrice(3995)).toBe("$3,995");
  });

  it("always shows two digits when there are cents", () => {
    expect(formatPrice(1249.5)).toBe("$1,249.50");
  });

  it("groups thousands with commas", () => {
    expect(formatPrice(10950)).toBe("$10,950");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0");
  });
});
