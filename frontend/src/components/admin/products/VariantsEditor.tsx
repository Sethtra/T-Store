import { useState } from "react";
import {
  RAM_PRESETS,
  STORAGE_PRESETS,
  draftAxes,
  draftLabel,
  rebuildDrafts,
  type VariantDraft,
} from "./variantDrafts";

interface VariantsEditorProps {
  value: VariantDraft[];
  onChange: (next: VariantDraft[]) => void;
}

const inputClass =
  "w-full px-2.5 py-1.5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]";

const normalise = (raw: string) => {
  const v = raw.trim().toUpperCase().replace(/\s+/g, "");
  return /^\d+(\.\d+)?$/.test(v) ? `${v}GB` : v;
};

/**
 * Memory options: tick the RAM and storage sizes the phone comes in, then set
 * price and stock for each combination. Leave everything unticked for products
 * with a single price (chargers, cases…).
 */
const VariantsEditor = ({ value, onChange }: VariantsEditorProps) => {
  const { rams, storages } = draftAxes(value);
  const [custom, setCustom] = useState({ ram: "", storage: "" });

  const toggle = (axis: "ram" | "storage", item: string) => {
    const list = axis === "ram" ? rams : storages;
    const next = list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
    onChange(axis === "ram" ? rebuildDrafts(value, next, storages) : rebuildDrafts(value, rams, next));
  };

  const addCustom = (axis: "ram" | "storage") => {
    const item = normalise(custom[axis]);
    if (!item || item.length > 20) return;
    const list = axis === "ram" ? rams : storages;
    if (!list.includes(item)) toggle(axis, item);
    setCustom((c) => ({ ...c, [axis]: "" }));
  };

  const patch = (key: string, change: Partial<VariantDraft>) =>
    onChange(value.map((d) => (d.key === key ? { ...d, ...change } : d)));

  const chips = (axis: "ram" | "storage", presets: string[], selected: string[]) => (
    <div className="flex flex-wrap items-center gap-1.5">
      {[...new Set([...presets, ...selected])].map((item) => {
        const on = selected.includes(item);
        return (
          <button
            key={item}
            type="button"
            onClick={() => toggle(axis, item)}
            aria-pressed={on}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              on
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary,white)]"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]"
            }`}
          >
            {item}
          </button>
        );
      })}
      <input
        type="text"
        value={custom[axis]}
        maxLength={20}
        placeholder="Other…"
        aria-label={axis === "ram" ? "Other RAM size" : "Other storage size"}
        onChange={(e) => setCustom((c) => ({ ...c, [axis]: e.target.value }))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addCustom(axis);
          }
        }}
        onBlur={() => addCustom(axis)}
        className="w-20 rounded-full border border-dashed border-[var(--color-border)] bg-transparent px-3 py-1 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
      />
    </div>
  );

  return (
    <details className="group rounded-lg border border-[var(--color-border)]" open={value.length > 0}>
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-[var(--color-text-primary)]">
        <span>
          Memory options (RAM / storage)
          <span className="ml-2 font-normal text-[var(--color-text-muted)]">
            {value.length ? `${value.length} option${value.length === 1 ? "" : "s"}` : "Each option gets its own price and stock"}
          </span>
        </span>
        <span aria-hidden="true" className="text-[var(--color-text-muted)] transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>

      <div className="space-y-4 border-t border-[var(--color-border)] px-4 py-4">
        <div className="grid gap-3 sm:grid-cols-[5rem_1fr] sm:items-center">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">RAM</span>
          {chips("ram", RAM_PRESETS, rams)}
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Storage</span>
          {chips("storage", STORAGE_PRESETS, storages)}
        </div>

        {value.length === 0 ? (
          <p className="rounded border border-dashed border-[var(--color-border)] py-3 text-center text-xs italic text-[var(--color-text-muted)]">
            No memory options. The product uses the single Price and Stock above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">
                  <th className="pb-2 pr-2 font-semibold">Option</th>
                  <th className="pb-2 pr-2 font-semibold">Price ($)</th>
                  <th className="pb-2 pr-2 font-semibold">Original ($)</th>
                  <th className="pb-2 pr-2 font-semibold">Stock</th>
                  <th className="pb-2 text-center font-semibold">For sale</th>
                </tr>
              </thead>
              <tbody>
                {value.map((d) => (
                  <tr key={d.key} className={`border-t border-[var(--color-border)] ${d.is_active ? "" : "opacity-50"}`}>
                    <td className="whitespace-nowrap py-2 pr-2 font-medium text-[var(--color-text-primary)]">{draftLabel(d)}</td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        aria-label={`${draftLabel(d)} price`}
                        value={d.price}
                        onChange={(e) => patch(d.key, { price: e.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Optional"
                        aria-label={`${draftLabel(d)} original price`}
                        value={d.original_price}
                        onChange={(e) => patch(d.key, { original_price: e.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        aria-label={`${draftLabel(d)} stock`}
                        value={d.stock}
                        onChange={(e) => patch(d.key, { stock: e.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${draftLabel(d)} for sale`}
                        checked={d.is_active}
                        onChange={(e) => patch(d.key, { is_active: e.target.checked })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Untick “For sale” for combinations you don't sell. The product's Price and Stock become the lowest price and the total stock.
            </p>
          </div>
        )}
      </div>
    </details>
  );
};

export default VariantsEditor;
