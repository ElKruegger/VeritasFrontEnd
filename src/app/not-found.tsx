import type { Metadata } from "next";
import Link from "next/link";

import { departmentHref, departments } from "@/lib/navigation";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-24 md:px-10 md:py-32">
      <p className="text-[11px] tracking-[var(--tracking-label)] text-stone uppercase">
        Error 404
      </p>
      <h1 className="mt-6 font-display text-[44px] leading-none md:text-[64px]">
        This page has moved on.
      </h1>
      <p className="mt-6 max-w-md text-[15px] leading-relaxed text-stone">
        The piece may have sold out for good, or the link is mistyped. The
        departments are a good place to start again.
      </p>
      <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[13px]">
        {departments.map((d) => (
          <li key={d.slug}>
            <Link
              href={departmentHref(d.slug)}
              className="underline underline-offset-[6px]"
            >
              {d.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
