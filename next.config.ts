import type { NextConfig } from "next";

// Where the Véritas API (ASP.NET Core) lives. Locally: the backend's "http"
// launch profile. On Vercel: the Render URL, set as an environment variable
// of the Vercel project.
const LOCAL_API_URL = "http://localhost:5152";

function apiUrl(): string {
  const url = process.env.API_URL?.trim().replace(/\/+$/, "");
  if (url) return url;

  // A deployed build silently proxying to localhost would fail on every
  // request; refuse to build instead.
  if (process.env.VERCEL) {
    throw new Error(
      "API_URL is not set. Add it to the Vercel project's environment variables.",
    );
  }
  return LOCAL_API_URL;
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // The browser only ever talks to this site: /api/* is proxied to the API
  // by the server. For the browser the API is therefore same-origin, so the
  // auth cookies are first-party — cross-site cookies (a *.vercel.app page
  // calling *.onrender.com) are blocked by Safari/iOS and others.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl()}/api/:path*` }];
  },

  // Same protections the API sends on its own responses (see the backend's
  // SecurityHeaders). A Content-Security-Policy needs nonces with Next.js
  // and is added once the pages exist.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // No "X-Powered-By: Next.js" header (same reason the API hides Kestrel).
  poweredByHeader: false,
};

export default nextConfig;
