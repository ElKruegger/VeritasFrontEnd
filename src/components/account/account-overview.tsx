"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { browserApi } from "@/lib/api/browser";
import { useSession, useSetSession } from "@/lib/auth/session";

// The account page reads the session in the browser (see session.ts), so
// sending a guest to the sign-in page happens here, once the API has
// answered. Nothing private is in the page itself: the details come from
// the API, which only answers for a valid session.
export function AccountOverview() {
  const router = useRouter();
  const setSession = useSetSession();
  const { data: user, isPending, isError } = useSession();
  const [signingOut, startSignOut] = useTransition();
  const [signOutFailed, setSignOutFailed] = useState(false);
  // Set on sign-out, so the guest redirect below doesn't send someone who
  // just signed out to the sign-in page instead of the home page.
  const signedOut = useRef(false);

  useEffect(() => {
    if (!isPending && !isError && !user && !signedOut.current) {
      router.replace("/account/login");
    }
  }, [isPending, isError, user, router]);

  function signOut() {
    setSignOutFailed(false);
    startSignOut(async () => {
      try {
        const { response } = await browserApi.POST("/api/v1/auth/logout");
        if (!response.ok)
          throw new Error(`Logout failed (${response.status}).`);
        signedOut.current = true;
        setSession(null);
        router.push("/");
      } catch {
        setSignOutFailed(true);
      }
    });
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-oxblood">
        We couldn&apos;t load your account. Refresh the page to try again.
      </p>
    );
  }

  if (!user) {
    return (
      <div aria-busy className="space-y-4">
        <span className="sr-only">Loading your account…</span>
        <div className="h-3 w-24 bg-mist" />
        <div className="h-12 w-72 max-w-full bg-mist" />
      </div>
    );
  }

  return (
    <>
      <p className="text-[11px] tracking-[var(--tracking-label)] text-stone uppercase">
        Your account
      </p>
      <h1 className="mt-4 font-display text-[40px] leading-none md:text-[56px]">
        Good to see you, {user.firstName}.
      </h1>

      <div className="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
        <section className="bg-paper p-6 md:p-8">
          <h2 className="text-[11px] tracking-[var(--tracking-label)] text-stone uppercase">
            Details
          </h2>
          <p className="mt-5 text-[15px]">
            {user.firstName} {user.lastName}
          </p>
          <p className="mt-1 text-[15px] break-all text-stone">{user.email}</p>
        </section>

        <section className="bg-paper p-6 md:p-8">
          <h2 className="text-[11px] tracking-[var(--tracking-label)] text-stone uppercase">
            Orders
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-stone">
            Your orders will appear here once the bag opens.
          </p>
          <Link
            href="/shop/new"
            className="mt-4 inline-block text-[13px] underline underline-offset-[6px]"
          >
            Browse new arrivals
          </Link>
        </section>

        <section className="bg-paper p-6 md:p-8">
          <h2 className="text-[11px] tracking-[var(--tracking-label)] text-stone uppercase">
            Addresses
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-stone">
            Saved delivery addresses are coming soon.
          </p>
        </section>
      </div>

      <div className="mt-12">
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="border border-ink px-8 py-3.5 text-xs tracking-[var(--tracking-label)] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
        {signOutFailed && (
          <p role="alert" className="mt-3 text-sm text-oxblood">
            We couldn&apos;t sign you out. Please try again.
          </p>
        )}
      </div>
    </>
  );
}
