export const ACCOUNT_HOME = "/account";

/**
 * Where to send someone after they sign in, from the ?next= query value.
 *
 * Only a path on this site is accepted. Anything else would make the sign-in
 * page an open redirect: a phishing mail could link to the real login page
 * with ?next=https://evil.example and send people there right after they
 * typed their password. "//evil.example" and "/\evil.example" are also
 * external (browsers read both as protocol-relative URLs), so they are
 * rejected too.
 */
export function safeNextPath(value: unknown): string {
  const next = Array.isArray(value) ? value[0] : value;
  if (typeof next !== "string" || next.length > 2000) return ACCOUNT_HOME;
  if (
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/\\")
  ) {
    return ACCOUNT_HOME;
  }
  // Control characters (tabs, newlines) are stripped by URL parsers, which
  // can turn "/\t/evil.example" into "//evil.example".
  if (/[\u0000-\u001f\u007f]/.test(next)) return ACCOUNT_HOME;
  return next;
}

/** A link to a sign-in or register page that comes back to `next`. */
export function withNext(path: string, next: string): string {
  return next === ACCOUNT_HOME
    ? path
    : `${path}?next=${encodeURIComponent(next)}`;
}
