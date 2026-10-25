import { useEffect, useMemo, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import type { ColorAngle } from "../../../types/product";
import type { ColorDraft } from "./colorDrafts";
import { COLOR_ANGLES } from "../../../utils/phoneSpecs";
import { colorHex } from "../../../utils/attributes";

const compress = async (file: File) => {
  try {
    const out = await imageCompression(file, {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.85,
    });
    const base = file.name.split(".").slice(0, -1).join(".") || "color";
    return new File([out], `${base}.webp`, { type: "image/webp", lastModified: Date.now() });
  } catch {
    return file;
  }
};

const FilePreview = ({ file, alt }: { file: File; alt: string }) => {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return <img src={url} alt={alt} className="h-full w-full object-contain" />;
};

const inputClass =
  "w-full px-3 py-1.5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]";

interface ColorPhotosEditorProps {
  value: ColorDraft[];
  onChange: (next: ColorDraft[]) => void;
}

/**
 * Colour list for the storefront's colour section. Each colour has six fixed
 * photo slots (front, rear, left, right, top, bottom); empty slots are hidden in the store.
 * The first colour is the one shown by default.
 */
const ColorPhotosEditor = ({ value, onChange }: ColorPhotosEditorProps) => {
  const [busy, setBusy] = useState<string | null>(null);
  // Latest list, so a photo that finishes compressing doesn't undo edits made meanwhile
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  const update = (key: string, fn: (d: ColorDraft) => ColorDraft) =>
    onChange(latest.current.map((d) => (d.key === key ? fn(d) : d)));
  const patch = (key: string, change: Partial<ColorDraft>) => update(key, (d) => ({ ...d, ...change }));

  const move = (index: number, dir: -1 | 1) => {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const pickPhoto = async (draft: ColorDraft, angle: ColorAngle, file: File | undefined) => {
    if (!file) return;
    setBusy(`${draft.key}-${angle}`);
    const compressed = await compress(file);
    setBusy(null);
    update(draft.key, (d) => ({ ...d, files: { ...d.files, [angle]: compressed } }));
  };

  const clearPhoto = (draft: ColorDraft, angle: ColorAngle) =>
    update(draft.key, (d) => {
      const files = { ...d.files };
      delete files[angle];
      return { ...d, files, images: { ...d.images, [angle]: null } };
    });

  const addColor = () =>
    onChange([...value, { key: `n${Date.now()}`, name: "", name_kh: "", hex: "", images: {}, files: {} }]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">Colours &amp; colour photos</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Six photos per colour. The first colour shows by default; empty slots are hidden.
          </p>
        </div>
        <button type="button" onClick={addColor} className="shrink-0 text-xs text-[var(--color-primary)] hover:underline">
          + Add colour
        </button>
      </div>

      {value.length === 0 && (
        <div className="rounded border border-dashed border-[var(--color-border)] py-3 text-center text-xs italic text-[var(--color-text-muted)]">
          No colours yet. Add one to show the colour section on the product page.
        </div>
      )}

      {value.map((draft, index) => {
        const swatch = draft.hex || colorHex(draft.name || "grey");
        return (
          <fieldset key={draft.key} className="space-y-3 rounded-lg border border-[var(--color-border)] p-3">
            <legend className="sr-only">Colour {index + 1}</legend>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="color"
                aria-label="Swatch colour"
                value={/^#[0-9a-f]{6}$/i.test(swatch) ? swatch : "#b5b7ba"}
                onChange={(e) => patch(draft.key, { hex: e.target.value })}
                className="h-8 w-9 shrink-0 cursor-pointer rounded border border-[var(--color-border)] bg-transparent p-0.5"
              />
              <input
                type="text"
                required
                maxLength={50}
                placeholder="Colour name (EN), e.g. Black"
                aria-label="Colour name (EN)"
                value={draft.name}
                onChange={(e) => patch(draft.key, { name: e.target.value })}
                className={`${inputClass} min-w-[9rem] flex-1`}
              />
              <input
                type="text"
                maxLength={50}
                placeholder="ឈ្មោះពណ៌ (KH)"
                aria-label="Colour name (KH)"
                value={draft.name_kh}
                onChange={(e) => patch(draft.key, { name_kh: e.target.value })}
                className={`${inputClass} min-w-[9rem] flex-1`}
              />
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" className="rounded p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] disabled:opacity-30">
                  ↑
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === value.length - 1} aria-label="Move down" className="rounded p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] disabled:opacity-30">
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((d) => d.key !== draft.key))}
                  className="rounded px-2 py-1.5 text-xs text-red-500 hover:bg-red-500/10"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {COLOR_ANGLES.map(({ key: angle, label }) => {
                const file = draft.files[angle];
                const url = draft.images[angle];
                const filled = Boolean(file || url);
                const isBusy = busy === `${draft.key}-${angle}`;
                return (
                  <div key={angle} className="space-y-1">
                    <div className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                      <label className="flex h-full w-full cursor-pointer items-center justify-center p-1.5">
                        {file ? (
                          <FilePreview file={file} alt={`${draft.name} ${label}`} />
                        ) : url ? (
                          <img src={url} alt={`${draft.name} ${label}`} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-lg text-[var(--color-text-muted)]">{isBusy ? "…" : "+"}</span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          aria-label={`${label} photo`}
                          disabled={isBusy}
                          onChange={(e) => {
                            void pickPhoto(draft, angle, e.target.files?.[0]);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      {filled && (
                        <button
                          type="button"
                          onClick={() => clearPhoto(draft, angle)}
                          aria-label={`Remove ${label} photo`}
                          className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] text-white opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      )}
                      {file && (
                        <span className="absolute inset-x-0 bottom-0 bg-blue-500/80 py-0.5 text-center text-[9px] text-white">New</span>
                      )}
                    </div>
                    <p className="text-center text-[11px] text-[var(--color-text-muted)]">{label}</p>
                  </div>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
};

export default ColorPhotosEditor;
