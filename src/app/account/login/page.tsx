import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthPage } from "@/components/auth/auth-page";
import { FormSkeleton } from "@/components/auth/form-fields";
import { SignInForm } from "@/components/auth/sign-in-form";
import { safeNextPath } from "@/lib/auth/next-path";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function SignInPage({
  searchParams,
}: PageProps<"/account/login">) {
  return (
    <AuthPage
      title="Sign in"
      intro="Welcome back. Sign in to see your orders and details."
    >
      {/* ?next= is request data: read inside the boundary so the frame above
          stays in the prerendered shell. */}
      <Suspense fallback={<FormSkeleton fields={2} />}>
        {searchParams.then((params) => (
          <SignInForm next={safeNextPath(params.next)} />
        ))}
      </Suspense>
    </AuthPage>
  );
}
