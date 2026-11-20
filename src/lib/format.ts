// Prices come from the API as plain numbers in USD (the store has a single
// currency). Formatted once here so every page shows them the same way.

// Whole amounts drop the cents ("$3,995", not "$3,995.00"), the usual
// presentation in luxury retail; any real fraction always shows two digits.
const wholeDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const withCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 3995 -> "$3,995" · 1249.5 -> "$1,249.50" */
export function formatPrice(amount: number): string {
  return Number.isInteger(amount)
    ? wholeDollars.format(amount)
    : withCents.format(amount);
}
