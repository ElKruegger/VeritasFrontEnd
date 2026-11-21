import { useId, type InputHTMLAttributes } from "react";

type TextFieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "id">;

// A labelled input whose hint and error are announced by screen readers
// (aria-describedby) and whose invalid state is exposed, not only colored.
export function TextField({
  label,
  name,
  error,
  hint,
  ...input
}: TextFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] tracking-[var(--tracking-label)] text-stone uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="mt-2 w-full border border-line bg-paper px-3 py-3 text-[15px] focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:border-oxblood"
        {...input}
      />
      {error ? (
        <p id={errorId} className="mt-2 text-xs text-oxblood">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="mt-2 text-xs text-stone">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="border border-oxblood px-4 py-3 text-sm text-oxblood"
    >
      {children}
    </div>
  );
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="w-full bg-ink py-4 text-xs tracking-[var(--tracking-label)] text-paper uppercase focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "One moment…" : children}
    </button>
  );
}

/** Placeholder with the form's footprint while the page streams in. */
export function FormSkeleton({ fields }: { fields: number }) {
  return (
    <div aria-hidden className="space-y-6">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i}>
          <div className="h-3 w-20 bg-mist" />
          <div className="mt-2 h-[50px] border border-line" />
        </div>
      ))}
      <div className="h-12 bg-mist" />
    </div>
  );
}
