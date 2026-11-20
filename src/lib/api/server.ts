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

export const api = createClient<paths>({
  baseUrl: apiBaseUrl(),
  headers: { Accept: "application/json" },
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
