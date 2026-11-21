import Link from "next/link";

import { departmentHref, departments } from "@/lib/navigation";

const clientServices = [
  { href: "/help/shipping", label: "Shipping" },
  { href: "/help/returns", label: "Returns & exchanges" },
  { href: "/help/sizing", label: "Size guide" },
  { href: "/help/contact", label: "Contact us" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 pt-16 pb-10 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <p className="font-display text-3xl tracking-[0.32em]">VÉRITAS</p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/70">
            Menswear, footwear, watches and fragrance, chosen for how they are
            made and how long they last.
          </p>
        </div>

        <nav aria-label="Shop" className="md:col-span-2 md:col-start-7">
          <h2 className="text-[11px] tracking-[var(--tracking-label)] text-paper/50 uppercase">
            Shop
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            {departments.map((d) => (
              <li key={d.slug}>
                <Link href={departmentHref(d.slug)} className="hover:underline">
                  {d.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Client services" className="md:col-span-2">
          <h2 className="text-[11px] tracking-[var(--tracking-label)] text-paper/50 uppercase">
            Client services
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            {clientServices.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <h2 className="text-[11px] tracking-[var(--tracking-label)] text-paper/50 uppercase">
            Account
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href="/account" className="hover:underline">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/account/orders" className="hover:underline">
                Orders
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 border-t border-paper/15 px-4 py-6 text-xs text-paper/50 md:flex-row md:justify-between md:px-10">
        <p>© 2026 Véritas</p>
        <p>
          A portfolio project. Products, prices and brands are shown for
          demonstration only.
        </p>
      </div>
    </footer>
  );
}
