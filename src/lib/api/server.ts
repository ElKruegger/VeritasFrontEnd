// Calls to the API from Server Components. They run on the Next.js server,
// so they go straight to the API (API_URL) instead of through the /api
// rewrite that the browser uses. API_URL is not a NEXT_PUBLIC_ variable:
// it never reaches the browser bundle.

const DEFAULT_API_URL = "http://localhost:5152";

function apiBaseUrl(): string {
  return (process.env.API_URL ?? DEFAULT_API_URL).trim().replace(/\/+$/, "");
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`API request ${path} failed with status ${status}`);
    this.name = "ApiError";
  }
}

/** GET /api/v1{path} and parse the JSON body. Throws ApiError on a non-2xx answer. */
export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}/api/v1${path}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new ApiError(response.status, path);
  return (await response.json()) as T;
}
