// Calls to the API from Server Components. They run on the Next.js server,
// so they go straight to the API (API_URL) instead of through the /api
// rewrite that the browser uses. API_URL is not a NEXT_PUBLIC_ variable:
// it never reaches the browser bundle.
//
// openapi-fetch types every call from schema.d.ts: the path, its query
// parameters and the response body are all checked by the compiler, e.g.
// api.GET("/api/v1/Products", { params: { query: { sort: "newest" } } }).
import createClient from "openapi-fetch";

import type { paths } from "@/lib/api/schema";

const DEFAULT_API_URL = "http://localhost:5152";

function apiBaseUrl(): string {
  return (process.env.API_URL ?? DEFAULT_API_URL).trim().replace(/\/+$/, "");
}

// How long a page waits for the API before giving up. Without a limit a hung
// API (a paused process, a stuck database connection) holds the page open
// until Next.js aborts the render about a minute later. With one, the page
// shows its "unavailable right now" message after a few seconds. Raise it
// with VERITAS_API_TIMEOUT_MS if the API sleeps when idle (free hosting
// tiers) and its cold start takes longer than this. Namespaced on purpose:
// a bare API_TIMEOUT_MS is already used by other tools' environments.
const DEFAULT_TIMEOUT_MS = 10_000;

export function apiTimeoutMs(value: string | undefined): number {
  const ms = Number(value);
  return Number.isInteger(ms) && ms > 0 ? ms : DEFAULT_TIMEOUT_MS;
}

const timeoutMs = apiTimeoutMs(process.env.VERITAS_API_TIMEOUT_MS);

export const api = createClient<paths>({
  baseUrl: apiBaseUrl(),
  headers: { Accept: "application/json" },
  // A fresh signal per request: the limit counts from each call's start.
  fetch: (request) =>
    fetch(request, { signal: AbortSignal.timeout(timeoutMs) }),
});

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`API request ${path} failed with status ${status}`);
    this.name = "ApiError";
  }
}

type ApiResult<T> = { data?: T; response: Response };

/** The body of a successful call. Throws ApiError on any non-2xx answer. */
export async function unwrap<T>(request: Promise<ApiResult<T>>): Promise<T> {
  const { data, response } = await request;
  if (!response.ok || data === undefined) {
    throw new ApiError(response.status, new URL(response.url).pathname);
  }
  return data;
}
