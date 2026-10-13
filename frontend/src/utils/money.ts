const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats a price for display, e.g. 1209 -> "$1,209.00". The store prices in USD. */
export const formatUSD = (value: number | string | null | undefined): string => {
  const n = typeof value === "string" ? parseFloat(value) : value ?? 0;
  return usd.format(Number.isFinite(n) ? (n as number) : 0);
};

export interface Discount {
  /** Whole percent off, e.g. 56 */
  percent: number;
  /** Amount saved per unit */
  save: number;
  original: number;
}

/** A discount exists only when an original ("was") price is set above the selling price. */
export const getDiscount = (
  price: number | string | null | undefined,
  original: number | string | null | undefined,
): Discount | null => {
  const p = Number(price);
  const o = Number(original);
  if (!Number.isFinite(p) || !Number.isFinite(o) || o <= 0 || o <= p) return null;
  return { percent: Math.round(((o - p) / o) * 100), save: o - p, original: o };
};
