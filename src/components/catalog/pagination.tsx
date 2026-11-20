import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  /** The URL of a page of the same listing (filters kept). */
  href: (page: number) => string;
};

// Plain links: every page of a listing has its own URL (crawlable, and
// opening page 3 in a new tab works).
export function Pagination({ page, totalPages, href }: PaginationProps) {
  if (totalPages <= 1) return null;

  const linkClass = "underline-offset-[6px] hover:underline";

  return (
    <nav
      aria-label="Pagination"
      className="mt-20 flex items-center justify-center gap-10 border-t border-line pt-8 text-[13px]"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={linkClass}>
          Previous
        </Link>
      ) : (
        <span aria-hidden className="text-stone/50">
          Previous
        </span>
      )}

      <span className="text-stone tabular-nums">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" className={linkClass}>
          Next
        </Link>
      ) : (
        <span aria-hidden className="text-stone/50">
          Next
        </span>
      )}
    </nav>
  );
}
