"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import type { z } from "zod";

import { problemFieldErrors, problemMessage } from "@/lib/api/problem";
import type { User } from "@/lib/api/types";
import { validate, type FieldErrors } from "@/lib/auth/schemas";
import { useSession, useSetSession } from "@/lib/auth/session";

type AuthResponse = { data?: User; error?: unknown; response: Response };

export type FormAlert = { status: number; message: string };

/**
 * What the sign-in and register forms share: validate in the browser, send,
 * show the API's answer next to the right field, and go to `next` once the
 * session exists. The inputs stay uncontrolled (the browser holds their
 * values; they are read once, on submit, through FormData).
 */
export function useAuthForm<T>({
  schema,
  send,
  next,
}: {
  schema: z.ZodType<T>;
  send: (input: T) => Promise<AuthResponse>;
  next: string;
}) {
  const router = useRouter();
  const setSession = useSetSession();
  const { data: user } = useSession();
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [alert, setAlert] = useState<FormAlert | null>(null);
  const [pending, startTransition] = useTransition();

  // Already signed in (another tab, or the back button): nothing to do here.
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  function showErrors(form: HTMLFormElement, fieldErrors: FieldErrors<T>) {
    setErrors(fieldErrors);
    const first = Object.keys(fieldErrors)[0];
    const input = first ? form.elements.namedItem(first) : null;
    if (input instanceof HTMLElement) input.focus();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setAlert(null);

    const result = validate(schema, new FormData(form));
    if (!result.ok) {
      showErrors(form, result.errors);
      return;
    }
    setErrors({});

    startTransition(async () => {
      try {
        const { data, error, response } = await send(result.data);
        if (data) {
          setSession(data);
          router.replace(next);
          return;
        }
        const fieldErrors = problemFieldErrors(error) as FieldErrors<T>;
        if (Object.keys(fieldErrors).length > 0) showErrors(form, fieldErrors);
        else
          setAlert({
            status: response.status,
            message: problemMessage(response.status, error),
          });
      } catch {
        setAlert({
          status: 0,
          message:
            "We couldn't reach Véritas. Check your connection and try again.",
        });
      }
    });
  }

  // Typing in a field clears its message: the old one no longer applies.
  function onInput(event: FormEvent<HTMLFormElement>) {
    const name = (event.target as HTMLInputElement).name as keyof T & string;
    setErrors((current) =>
      current[name] ? { ...current, [name]: undefined } : current,
    );
  }

  return { errors, alert, pending, onSubmit, onInput };
}
