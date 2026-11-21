import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthPage } from "@/components/auth/auth-page";
import { FormSkeleton } from "@/components/auth/form-fields";
import { RegisterForm } from "@/components/auth/register-form";
import { safeNextPath } from "@/lib/auth/next-path";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false },
};

export default function RegisterPage({
  searchParams,
}: PageProps<"/account/register">) {
  return (
    <AuthPage
      title="Create an account"
      intro="Keep your details in one place and follow every order from the atelier to your door."
    >
      <Suspense fallback={<FormSkeleton fields={4} />}>
        {searchParams.then((params) => (
          <RegisterForm next={safeNextPath(params.next)} />
        ))}
      </Suspense>
    </AuthPage>
  );
}
