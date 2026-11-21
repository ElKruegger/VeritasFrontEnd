import { describe, expect, it, vi } from "vitest";

import { createRefreshingFetch } from "./browser";

const ORIGIN = "http://localhost:3000";

function request(path: string, init?: RequestInit) {
  return new Request(`${ORIGIN}${path}`, init);
}

// A fake API: answers 401 to protected calls until a refresh succeeded.
function fakeApi({ refreshOk }: { refreshOk: boolean }) {
  let signedIn = false;
  const calls: string[] = [];
  const fetch = vi.fn(async (req: Request) => {
    const path = new URL(req.url).pathname;
    calls.push(path);
    if (path === "/api/v1/auth/refresh") {
      signedIn = refreshOk;
      return new Response(null, { status: refreshOk ? 200 : 401 });
    }
    if (path === "/api/v1/auth/login")
      return new Response(null, { status: 401 });
    return new Response(null, { status: signedIn ? 200 : 401 });
  });
  return { fetch, calls };
}

describe("createRefreshingFetch", () => {
  it("refreshes once and repeats the call after a 401", async () => {
    const api = fakeApi({ refreshOk: true });
    const response = await createRefreshingFetch(api.fetch)(
      request("/api/v1/auth/me"),
    );

    expect(response.status).toBe(200);
    expect(api.calls).toEqual([
      "/api/v1/auth/me",
      "/api/v1/auth/refresh",
      "/api/v1/auth/me",
    ]);
  });

  it("returns the 401 when the session cannot be refreshed", async () => {
    const api = fakeApi({ refreshOk: false });
    const response = await createRefreshingFetch(api.fetch)(
      request("/api/v1/auth/me"),
    );

    expect(response.status).toBe(401);
    expect(api.calls).toEqual(["/api/v1/auth/me", "/api/v1/auth/refresh"]);
  });

  it("never refreshes after a failed login", async () => {
    const api = fakeApi({ refreshOk: true });
    const response = await createRefreshingFetch(api.fetch)(
      request("/api/v1/auth/login", { method: "POST", body: "{}" }),
    );

    expect(response.status).toBe(401);
    expect(api.calls).toEqual(["/api/v1/auth/login"]);
  });

  it("shares one refresh between concurrent calls", async () => {
    const api = fakeApi({ refreshOk: true });
    const send = createRefreshingFetch(api.fetch);

    const responses = await Promise.all([
      send(request("/api/v1/auth/me")),
      send(request("/api/v1/orders")),
    ]);

    expect(responses.map((r) => r.status)).toEqual([200, 200]);
    expect(api.calls.filter((p) => p === "/api/v1/auth/refresh")).toHaveLength(
      1,
    );
  });

  it("repeats the request with its original body", async () => {
    const bodies: string[] = [];
    let refreshed = false;
    const send = createRefreshingFetch(async (req) => {
      if (req.url.endsWith("/refresh")) {
        refreshed = true;
        return new Response(null, { status: 200 });
      }
      bodies.push(await req.text());
      return new Response(null, { status: refreshed ? 200 : 401 });
    });

    await send(
      request("/api/v1/addresses", {
        method: "POST",
        body: '{"city":"Porto"}',
      }),
    );

    expect(bodies).toEqual(['{"city":"Porto"}', '{"city":"Porto"}']);
  });
});
