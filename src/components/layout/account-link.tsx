"use client";

import Link from "next/link";

import { useSession } from "@/lib/auth/session";

// The header's account entry. It renders "Account" in the prerendered shell
// and while the session is being checked, then becomes the person's first
// name or "Sign in": the rest of the header never waits for it.
export function AccountLink({ className }: { className?: string }) {
  const { data: user, isPending } = useSession();

  if (!isPending && !user) {
    return (
      <Link href="/account/login" className={className}>
        Sign in
      </Link>
    );
  }

  return (
    <Link href="/account" className={className}>
      {user?.firstName || "Account"}
    </Link>
  );
}
