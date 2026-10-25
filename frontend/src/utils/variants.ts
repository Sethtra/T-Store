import type { ProductVariant } from "../types/product";

/** "512GB" -> 512, "1TB" -> 1024; unknown text sorts last. */
export const capacityValue = (value: string | null | undefined): number => {
  const m = String(value ?? "").trim().match(/^(\d+(?:\.\d+)?)\s*(TB|GB|MB)?$/i);
  if (!m) return Number.MAX_SAFE_INTEGER;
  const n = parseFloat(m[1]);
  const unit = (m[2] ?? "GB").toUpperCase();
  return unit === "TB" ? n * 1024 : unit === "MB" ? n / 1024 : n;
};

const uniqueSorted = (values: (string | null)[]) =>
  [...new Set(values.filter((v): v is string => Boolean(v)))].sort((a, b) => capacityValue(a) - capacityValue(b));

/** The RAM and storage choices that exist across a product's options, smallest first. */
export const optionAxes = (variants: ProductVariant[]) => ({
  rams: uniqueSorted(variants.map((v) => v.ram)),
  storages: uniqueSorted(variants.map((v) => v.storage)),
});

export const findVariant = (variants: ProductVariant[], ram: string | null, storage: string | null) =>
  variants.find((v) => (v.ram ?? null) === ram && (v.storage ?? null) === storage);

/** Cheapest option that is in stock, else the cheapest overall. */
export const defaultVariant = (variants: ProductVariant[]): ProductVariant | undefined => {
  const byPrice = [...variants].sort((a, b) => Number(a.price) - Number(b.price));
  return byPrice.find((v) => v.stock > 0) ?? byPrice[0];
};

/** Lowest and highest option price, or null when there are no options. */
export const priceRange = (variants: ProductVariant[] | undefined) => {
  if (!variants?.length) return null;
  const prices = variants.map((v) => Number(v.price));
  return { min: Math.min(...prices), max: Math.max(...prices) };
};
