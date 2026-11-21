// The frame shared by the sign-in and register pages: one narrow column, so
// the form reads top to bottom on every screen size.
export function AuthPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 md:py-24">
      <p className="text-[11px] tracking-[var(--tracking-label)] text-stone uppercase">
        Your account
      </p>
      <h1 className="mt-4 font-display text-[40px] leading-none md:text-[52px]">
        {title}
      </h1>
      <p className="mt-5 mb-10 text-[15px] leading-relaxed text-stone">
        {intro}
      </p>
      {children}
    </div>
  );
}
