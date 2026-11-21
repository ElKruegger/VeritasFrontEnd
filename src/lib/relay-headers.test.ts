import { describe, expect, it } from "vitest";

import {
  CLIENT_IP_HEADER,
  relayHeaders,
  SECRET_HEADER,
  visitorIp,
} from "./relay-headers";

const secret = "a-test-secret-that-is-long-enough-123";

describe("visitorIp", () => {
  it("prefers x-real-ip, then the first x-forwarded-for entry", () => {
    expect(
      visitorIp(
        new Headers({
          "x-real-ip": "203.0.113.7",
          "x-forwarded-for": "1.1.1.1",
        }),
        true,
      ),
    ).toBe("203.0.113.7");
    expect(
      visitorIp(
        new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }),
        true,
      ),
    ).toBe("203.0.113.7");
  });

  it("trusts nothing off the hosting platform, where the client sets these", () => {
    expect(
      visitorIp(new Headers({ "x-real-ip": "203.0.113.7" }), false),
    ).toBeNull();
  });
});

describe("relayHeaders", () => {
  const onVercel = { secret, trustPlatform: true };

  it("vouches for the visitor's IP with the secret", () => {
    const headers = relayHeaders(
      new Headers({ "x-real-ip": "203.0.113.7" }),
      onVercel,
    );

    expect(headers.get(SECRET_HEADER)).toBe(secret);
    expect(headers.get(CLIENT_IP_HEADER)).toBe("203.0.113.7");
  });

  it("drops copies of its headers sent by the browser", () => {
    const forged = new Headers({
      [SECRET_HEADER]: "guess",
      [CLIENT_IP_HEADER]: "6.6.6.6",
      "x-real-ip": "203.0.113.7",
    });

    expect(relayHeaders(forged, onVercel).get(CLIENT_IP_HEADER)).toBe(
      "203.0.113.7",
    );

    const local = relayHeaders(forged, {
      secret: undefined,
      trustPlatform: false,
    });
    expect(local.has(SECRET_HEADER)).toBe(false);
    expect(local.has(CLIENT_IP_HEADER)).toBe(false);
  });

  it("keeps every other header, cookies included", () => {
    const headers = relayHeaders(
      new Headers({
        cookie: "access_token=abc",
        "content-type": "application/json",
      }),
      onVercel,
    );

    expect(headers.get("cookie")).toBe("access_token=abc");
    expect(headers.get("content-type")).toBe("application/json");
  });

  it("adds nothing without a secret", () => {
    const headers = relayHeaders(new Headers({ "x-real-ip": "203.0.113.7" }), {
      secret: undefined,
      trustPlatform: true,
    });

    expect(headers.has(SECRET_HEADER)).toBe(false);
    expect(headers.has(CLIENT_IP_HEADER)).toBe(false);
  });
});
