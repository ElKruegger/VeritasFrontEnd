"use client";

// Who is signed in, as far as the browser knows. The source of truth is the
// API (/auth/me reads the access-token cookie); TanStack Query keeps the
// answer in memory so every component that asks shares one request, and
// signing in or out updates them all at once.
//
// Why on the client rather than in a Server Component: the access token
// lives 15 minutes, and renewing it means writing new cookies, which a
// Server Component cannot do. The browser renews it (see browser.ts). The
// session only decides what the UI shows: every protected call is still
// authorized by the API itself.
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { browserApi } from "@/lib/api/browser";
import type { User } from "@/lib/api/types";

export const sessionKey = ["session"] as const;

// A hint, not a secret: "this browser had a session". Without it every
// guest page load would ask /auth/me, get a 401, then try a refresh that
// is bound to fail, and the refresh endpoint is rate-limited per IP.
const HINT_KEY = "veritas.session";

function readHint(): boolean {
  try {
    return localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return true; // storage blocked: ask the API rather than assume a guest
  }
}

function writeHint(signedIn: boolean) {
  try {
    if (signedIn) localStorage.setItem(HINT_KEY, "1");
    else localStorage.removeItem(HINT_KEY);
  } catch {
    // Private mode with storage disabled: the hint is an optimization only.
  }
}

async function fetchSession(): Promise<User | null> {
  if (!readHint()) return null;

  const { data, response } = await browserApi.GET("/api/v1/auth/me");
  if (response.status === 401) {
    writeHint(false);
    return null;
  }
  if (!data) throw new Error(`Session check failed (${response.status}).`);
  return data;
}

export function useSession() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: fetchSession,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

/** Records the outcome of a sign-in, registration or sign-out everywhere. */
export function useSetSession() {
  const queryClient = useQueryClient();
  return (user: User | null) => {
    writeHint(user !== null);
    queryClient.setQueryData(sessionKey, user);
  };
}
