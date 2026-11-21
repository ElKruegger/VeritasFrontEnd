"use client";

import Link from "next/link";

import { browserApi } from "@/lib/api/browser";
import { withNext } from "@/lib/auth/next-path";
import { signInSchema } from "@/lib/auth/schemas";

import { FormAlert, SubmitButton, TextField } from "./form-fields";
import { useAuthForm } from "./use-auth-form";

export function SignInForm({ next }: { next: string }) {
  const { errors, alert, pending, onSubmit, onInput } = useAuthForm({
    schema: signInSchema,
    send: (body) => browserApi.POST("/api/v1/auth/login", { body }),
    next,
  });

  return (
    <>
      <form
        noValidate
        onSubmit={onSubmit}
        onInput={onInput}
        className="space-y-6"
      >
        {alert && <FormAlert>{alert.message}</FormAlert>}
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
          autoComplete="current-password"
          error={errors.password}
        />
        <SubmitButton pending={pending}>Sign in</SubmitButton>
      </form>

      <p className="mt-10 border-t border-line pt-8 text-sm text-stone">
        New to Véritas?{" "}
        <Link
          href={withNext("/account/register", next)}
          className="text-ink underline underline-offset-[6px]"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
