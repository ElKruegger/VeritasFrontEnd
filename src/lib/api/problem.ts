// The API answers errors as RFC 9457 problem details ("title", "detail",
// and for validation errors an "errors" map keyed by DTO property name).

type Problem = {
  title?: string | null;
  detail?: string | null;
  errors?: Record<string, string[]> | null;
};

function asProblem(body: unknown): Problem {
  return typeof body === "object" && body !== null ? (body as Problem) : {};
}

/**
 * The validation messages of a 400, keyed like the form's fields: the API
 * names them after its C# properties ("FirstName"), the forms in camelCase.
 */
export function problemFieldErrors(body: unknown): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [key, messages] of Object.entries(asProblem(body).errors ?? {})) {
    const field = key.charAt(0).toLowerCase() + key.slice(1);
    if (messages[0]) errors[field] = messages[0];
  }
  return errors;
}

/** A sentence to show for a failed request that isn't about one field. */
export function problemMessage(status: number, body: unknown): string {
  if (status === 429) {
    return "Too many attempts in a short time. Wait a minute, then try again.";
  }
  const problem = asProblem(body);
  if (status < 500 && problem.detail) return problem.detail;
  return "Something went wrong on our side. Please try again in a moment.";
}
