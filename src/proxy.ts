// Next.js Proxy (formerly "middleware"): runs before a request reaches a
// page or a rewrite. Here it only touches /api/* requests on their way to the
// API (the rewrite in next.config.ts), adding who the visitor is.
import { NextResponse, type NextRequest } from "next/server";

import { relayHeaders } from "@/lib/relay-headers";

export function proxy(request: NextRequest) {
  return NextResponse.next({
    // `request.headers` changes what the API receives; never use
    // `headers` here, which would send the secret back to the browser.
    request: {
      headers: relayHeaders(request.headers, {
        secret: process.env.STOREFRONT_PROXY_SECRET,
        trustPlatform: process.env.VERCEL === "1",
      }),
    },
  });
}

export const config = { matcher: "/api/:path*" };
