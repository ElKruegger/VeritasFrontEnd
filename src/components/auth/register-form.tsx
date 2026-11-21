"use client";

import Link from "next/link";

import { browserApi } from "@/lib/api/browser";
import { withNext } from "@/lib/auth/next-path";
import { registerSchema } from "@/lib/auth/schemas";

import { FormAlert, SubmitButton, TextField } from "./form-fields";
import { useAuthForm } from "./use-auth-form";

export function RegisterForm({ next }: { next: string }) {
  const { errors, alert, pending, onSubmit, onInput } = useAuthForm({
    schema: registerSchema,
    send: (body) => browserApi.POST("/api/v1/auth/register", { body }),
    next,
  });
  const signInHref = withNext("/account/login", next);

  return (
    <>
      <form
        noValidate
        onSubmit={onSubmit}
        onInput={onInput}
        className="space-y-6"
      >
        {alert && (
          <FormAlert>
            {alert.status === 409 ? (
              <>
                There is already an account with this email.{" "}
                <Link
                  href={signInHref}
                  className="underline underline-offset-4"
                >
                  Sign in instead
                </Link>
              </>
            ) : (
              alert.message
            )}
          </FormAlert>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            label="First name"
            name="firstName"
            autoComplete="given-name"
            error={errors.firstName}
          />
          <TextField
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            error={errors.lastName}
          />
        </div>
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          error={errors.email}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a digit."
          error={errors.password}
        />
        <SubmitButton pending={pending}>Create account</SubmitButton>
      </form>

      <p className="mt-10 border-t border-line pt-8 text-sm text-stone">
        Already have an account?{" "}
        <Link
          href={signInHref}
          className="text-ink underline underline-offset-[6px]"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
