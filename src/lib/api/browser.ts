// Calls to the API from the browser (Client Components). They go to this
// site's own /api/* path, which next.config.ts proxies to the API, so the
// httpOnly auth cookies are first-party and travel with every call. The
// browser never sees the tokens: it only holds the cookies.
import createClient from "openapi-fetch";

import type { paths } from "@/lib/api/schema";

// These answer 401 for a wrong password or a dead session; retrying them
// after a refresh would be pointless (and the refresh call itself must
// never trigger another refresh).
const NO_RETRY = /^\/api\/v1\/auth\/(login|register|refresh|logout)$/;

const REFRESH_PATH = "/api/v1/auth/refresh";

type Fetch = (request: Request) => Promise<Response>;

/**
 * A fetch that keeps the session alive. The access token lives 15 minutes;
 * when a call comes back 401, this asks the API for a new pair of tokens
 * (the refresh token cookie) and repeats the call once. The person never
 * notices the expiry.
 *
 * Refreshes are serialized: the API rotates the refresh token on every use
 * and treats a second use of an old token as theft (it revokes every
 * session of the account). Two calls refreshing at once would trip that,
 * so concurrent 401s in this tab share one refresh, and other tabs wait
 * their turn through a Web Lock (they share the same cookies, so each one
 * sends the newest token).
 */
export function createRefreshingFetch(baseFetch: Fetch): Fetch {
  let inFlight: Promise<boolean> | null = null;

  async function refresh(origin: string): Promise<boolean> {
    const send = () =>
      baseFetch(
        new Request(new URL(REFRESH_PATH, origin), {
          method: "POST",
          credentials: "same-origin",
        }),
      ).then(
        (response) => response.ok,
        () => false,
      );

    return typeof navigator !== "undefined" && navigator.locks
      ? navigator.locks.request("veritas-session-refresh", send)
      : send();
  }

  return async (request) => {
    const retry = request.clone();
    const response = await baseFetch(request);

    const url = new URL(request.url);
    if (response.status !== 401 || NO_RETRY.test(url.pathname)) {
      return response;
    }

    inFlight ??= refresh(url.origin).finally(() => {
      inFlight = null;
    });
    return (await inFlight) ? baseFetch(retry) : response;
  };
}

export const browserApi = createClient<paths>({
  headers: { Accept: "application/json" },
  credentials: "same-origin",
  fetch: createRefreshingFetch((request) => fetch(request)),
});
