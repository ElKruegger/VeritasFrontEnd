import Link from "next/link";

import { departmentHref, departments } from "@/lib/navigation";

// Server Component: the header is identical for everyone until accounts and
// the bag exist, so it is part of the prerendered shell. The mobile menu is a
// native <details> element: it opens and closes without any JavaScript.
//
// Layout: wordmark centred on its own row, departments on a row below (from
// lg up). Side by side, six departments don't fit next to the wordmark on a
// laptop screen.
export function SiteHeader() {
  return (
    <header className="relative border-b border-line bg-paper">
      <p className="border-b border-line px-4 py-2 text-center text-[11px] tracking-[var(--tracking-label)] text-stone uppercase">
        Complimentary shipping on orders over $500
        <span className="hidden sm:inline"> · Returns within 30 days</span>
      </p>

      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 py-5 md:px-10 lg:py-7">
        <div>
          <details className="group lg:hidden">
            <summary className="cursor-pointer list-none text-xs tracking-[var(--tracking-label)] uppercase [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Menu</span>
              <span className="hidden group-open:inline">Close</span>
            </summary>
            <nav
              aria-label="Departments"
              className="absolute inset-x-0 z-40 mt-5 border-y border-line bg-paper px-4 py-6"
            >
              <ul className="space-y-4">
                {departments.map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={departmentHref(d.slug)}
                      className="font-display text-2xl"
                    >
                      {d.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>

          <Link
            href="/search"
            className="hidden text-[13px] underline-offset-[6px] hover:underline lg:inline"
          >
            Search
          </Link>
        </div>

        <Link
          href="/"
          className="font-display text-[26px] tracking-[0.32em] md:text-[36px]"
          aria-label="Véritas, home"
        >
          VÉRITAS
        </Link>

        <ul className="flex justify-end gap-5 text-[13px]">
          <li className="hidden sm:block">
            <Link
              href="/account"
              className="underline-offset-[6px] hover:underline"
            >
              Account
            </Link>
          </li>
          <li>
            <Link
              href="/bag"
              className="underline-offset-[6px] hover:underline"
            >
              Bag <span className="text-stone">(0)</span>
            </Link>
          </li>
        </ul>
      </div>

      <nav aria-label="Departments" className="hidden lg:block">
        <ul className="flex justify-center gap-x-10 pb-4 text-[12px] tracking-[var(--tracking-label)] uppercase">
          {departments.map((d) => (
            <li key={d.slug}>
              <Link
                href={departmentHref(d.slug)}
                className={`underline-offset-[8px] hover:underline ${d.slug === "outlet" ? "text-oxblood" : ""}`}
              >
                {d.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
