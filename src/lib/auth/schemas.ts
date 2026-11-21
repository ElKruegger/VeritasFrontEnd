// The sign-in and register forms, described once with Zod (a schema library:
// the rules live in one object that both validates the input and gives
// TypeScript its type). They mirror the API's FluentValidation rules
// (AuthValidators.cs) so most mistakes are caught before a request is sent;
// the API still validates everything, and its answer is shown the same way.
import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: "Enter your email address." })
    .max(256),
  // Only presence and size: holding an existing password to today's policy
  // would lock out accounts created under an older one.
  password: z.string().min(1, { error: "Enter your password." }).max(100),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { error: "Enter your first name." })
    .max(100, { error: "Use 100 characters or fewer." }),
  lastName: z
    .string()
    .trim()
    .min(1, { error: "Enter your last name." })
    .max(100, { error: "Use 100 characters or fewer." }),
  email: z
    .string()
    .trim()
    .max(256, { error: "Use 256 characters or fewer." })
    .pipe(z.email({ error: "Enter a valid email address." })),
  password: z
    .string()
    .min(8, { error: "Use at least 8 characters." })
    .max(100, { error: "Use 100 characters or fewer." })
    .regex(/[A-Za-z]/, { error: "Include at least one letter." })
    .regex(/[0-9]/, { error: "Include at least one digit." }),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type FieldErrors<T> = Partial<Record<keyof T & string, string>>;

/** The form's values, or the first message for each invalid field. */
export function validate<T>(
  schema: z.ZodType<T>,
  form: FormData,
):
  | { ok: true; data: T; errors?: undefined }
  | { ok: false; data?: undefined; errors: FieldErrors<T> } {
  const result = schema.safeParse(Object.fromEntries(form));
  if (result.success) return { ok: true, data: result.data };

  const errors: FieldErrors<T> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0]) as keyof T & string;
    errors[field] ??= issue.message;
  }
  return { ok: false, errors };
}
