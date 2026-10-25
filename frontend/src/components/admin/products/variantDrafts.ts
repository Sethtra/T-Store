import type { ProductVariant } from "../../../types/product";
import { capacityValue } from "../../../utils/variants";

/** A memory option being edited; numbers stay as strings while typing. */
export interface VariantDraft {
  key: string;
  id?: number;
  ram: string | null;
  storage: string | null;
  price: string;
  original_price: string;
  stock: string;
  is_active: boolean;
}

export const RAM_PRESETS = ["4GB", "6GB", "8GB", "12GB", "16GB", "24GB"];
export const STORAGE_PRESETS = ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];

export const toVariantDrafts = (variants: ProductVariant[] | undefined): VariantDraft[] =>
  (variants ?? []).map((v) => ({
    key: `v${v.id}`,
    id: v.id,
    ram: v.ram,
    storage: v.storage,
    price: v.price != null ? String(Number(v.price)) : "",
    original_price: v.original_price != null ? String(Number(v.original_price)) : "",
    stock: String(v.stock ?? 0),
    is_active: v.is_active ?? true,
  }));

const sortCap = (values: string[]) => [...values].sort((a, b) => capacityValue(a) - capacityValue(b));

/** The RAM and storage values currently ticked, read from the rows. */
export const draftAxes = (drafts: VariantDraft[]) => ({
  rams: sortCap([...new Set(drafts.map((d) => d.ram).filter((x): x is string => Boolean(x)))]),
  storages: sortCap([...new Set(drafts.map((d) => d.storage).filter((x): x is string => Boolean(x)))]),
});

/**
 * Rebuild the rows for a new set of ticked RAM/storage values: one row per combination.
 * Existing rows keep their price and stock; when the first storage (or RAM) is added,
 * a RAM-only (or storage-only) row hands its values to the new combination.
 */
export const rebuildDrafts = (drafts: VariantDraft[], rams: string[], storages: string[]): VariantDraft[] => {
  if (!rams.length && !storages.length) return [];
  const ramList: (string | null)[] = rams.length ? sortCap(rams) : [null];
  const storageList: (string | null)[] = storages.length ? sortCap(storages) : [null];
  const used = new Set<string>();
  const take = (pred: (d: VariantDraft) => boolean) => {
    const found = drafts.find((d) => !used.has(d.key) && pred(d));
    if (found) used.add(found.key);
    return found;
  };

  const out: VariantDraft[] = [];
  for (const ram of ramList) {
    for (const storage of storageList) {
      const existing =
        take((d) => d.ram === ram && d.storage === storage) ??
        take((d) => d.ram === ram && d.storage === null) ??
        take((d) => d.ram === null && d.storage === storage);
      out.push(
        existing
          ? { ...existing, ram, storage }
          : { key: `n${ram}-${storage}-${Date.now()}`, ram, storage, price: "", original_price: "", stock: "0", is_active: true },
      );
    }
  }
  return out;
};

export const draftLabel = (d: VariantDraft) => [d.ram, d.storage].filter(Boolean).join(" / ");

/** First problem in the rows, in plain words, or null when they can be saved. */
export const variantDraftError = (drafts: VariantDraft[]): string | null => {
  for (const d of drafts) {
    const price = Number(d.price);
    if (d.price.trim() === "" || !Number.isFinite(price) || price < 0) return `${draftLabel(d)}: enter a price.`;
    const stock = Number(d.stock);
    if (d.stock.trim() === "" || !Number.isInteger(stock) || stock < 0) return `${draftLabel(d)}: stock must be a whole number, 0 or more.`;
    if (d.original_price.trim() !== "" && !(Number(d.original_price) > price))
      return `${draftLabel(d)}: original price must be higher than the price, or empty.`;
  }
  return null;
};

/** Summary the product row shows: lowest active price and total active stock. */
export const draftSummary = (drafts: VariantDraft[]) => {
  const active = drafts.filter((d) => d.is_active && d.price.trim() !== "");
  if (!active.length) return null;
  return {
    price: Math.min(...active.map((d) => Number(d.price))),
    stock: active.reduce((sum, d) => sum + (Number(d.stock) || 0), 0),
  };
};

export const draftsToPayload = (drafts: VariantDraft[]) =>
  drafts.map((d) => ({
    id: d.id,
    ram: d.ram,
    storage: d.storage,
    price: Number(d.price),
    original_price: d.original_price.trim() === "" ? null : Number(d.original_price),
    stock: Number(d.stock),
    is_active: d.is_active,
  }));
