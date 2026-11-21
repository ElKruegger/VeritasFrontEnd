// Headers this site adds when it relays /api/* to the API (see proxy.ts).
//
// Behind the relay, the API sees this server's IP on every request, so its
// per-IP limit on login attempts would treat all visitors as one. The relay
// tells the API who the visitor is, and proves it's the relay with a secret
// shared by both sides (STOREFRONT_PROXY_SECRET). The API ignores the IP
// header without the secret (see the backend's StorefrontClientIpMiddleware).
export const SECRET_HEADER = "x-veritas-proxy-secret";
export const CLIENT_IP_HEADER = "x-veritas-client-ip";

/**
 * The visitor's IP as reported by the hosting platform. Only meaningful on
 * Vercel, whose edge sets x-real-ip and overwrites any x-forwarded-for the
 * client sent. Elsewhere both are whatever the client typed, so they are
 * not used (`trustPlatform` is false).
 */
export function visitorIp(
  headers: Headers,
  trustPlatform: boolean,
): string | null {
  if (!trustPlatform) return null;
  const ip =
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return ip || null;
}

/**
 * The request headers to send on to the API. Any copy of our own headers
 * arriving from the browser is dropped first: otherwise a visitor could send
 * x-veritas-client-ip and have the relay vouch for it with the secret.
 */
export function relayHeaders(
  incoming: Headers,
  {
    secret,
    trustPlatform,
  }: { secret: string | undefined; trustPlatform: boolean },
): Headers {
  const headers = new Headers(incoming);
  headers.delete(SECRET_HEADER);
  headers.delete(CLIENT_IP_HEADER);

  const ip = visitorIp(incoming, trustPlatform);
  if (secret && ip) {
    headers.set(SECRET_HEADER, secret);
    headers.set(CLIENT_IP_HEADER, ip);
  }
  return headers;
}
