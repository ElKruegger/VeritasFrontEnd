type Env = Record<string, string | undefined>;

/**
 * The storefront's public address, the base for absolute URLs in metadata
 * (canonical links, Open Graph images). SITE_URL wins when set (a custom
 * domain); on Vercel the project's production domain is used, also for
 * preview deployments, so a preview never claims to be the canonical page.
 */
export function siteUrl(env: Env = process.env): URL {
  const explicit = env.SITE_URL?.trim();
  if (explicit) return new URL(explicit);

  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return new URL(`https://${vercel}`);

  return new URL("http://localhost:3000");
}
