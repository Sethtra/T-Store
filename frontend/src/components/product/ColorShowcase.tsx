import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize } from "lucide-react";
import type { ColorAngle, ProductColor } from "../../types/product";
import { COLOR_ANGLES } from "../../utils/phoneSpecs";
import { colorHex } from "../../utils/attributes";
import { getImageUrl } from "../../utils/image";

interface ColorShowcaseProps {
  colors: ProductColor[];
  /** Selected colour name; shared with the buy box so the cart gets the colour being viewed */
  selected: string;
  onSelect: (name: string) => void;
  isKh: boolean;
  title: string;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * "Colours": pick a colour, then step through its fixed angles
 * (front, rear, left, right, top, bottom). Angles without a photo are skipped.
 */
const ColorShowcase = ({ colors: allColors, selected, onSelect, isKh, title }: ColorShowcaseProps) => {
  const stageRef = useRef<HTMLDivElement>(null);
  // Only colours that have at least one photo; no photos at all hides the section
  const colors = allColors.filter((c) => COLOR_ANGLES.some((a) => c.images?.[a.key]));
  const color = colors.find((c) => c.name === selected) ?? colors[0];
  const angles = COLOR_ANGLES.filter((a) => color?.images?.[a.key]);
  const [angleKey, setAngleKey] = useState<ColorAngle | null>(null);

  if (!color) return null;

  // Keep the angle when switching colours if the new colour has it, else start at its first photo
  const active = angles.find((a) => a.key === angleKey) ?? angles[0];
  const activeIndex = active ? angles.indexOf(active) : -1;
  const label = (a: (typeof COLOR_ANGLES)[number]) => (isKh ? a.label_kh : a.label);
  const colorName = (c: ProductColor) => (isKh && c.name_kh ? c.name_kh : c.name);
  const step = (dir: 1 | -1) => {
    if (angles.length < 2) return;
    setAngleKey(angles[(activeIndex + dir + angles.length) % angles.length].key);
  };
  const toggleFullscreen = () => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  const arrowClass =
    "grid h-10 w-10 shrink-0 place-items-center rounded-[10px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] disabled:opacity-30";

  return (
    <section id="colors" className="mt-16 scroll-mt-24 md:mt-20" aria-labelledby="colors-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="colors-heading" className="text-2xl font-semibold tracking-[-0.025em] sm:text-[2rem] sm:leading-none">
            {isKh ? "ពណ៌" : "Colours"}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {isKh ? `${title} ពណ៌${colorName(color)}` : `${title} in ${colorName(color)}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={isKh ? "ជ្រើសពណ៌" : "Choose a colour"}>
          {colors.map((c) => {
            const isActive = c.id === color.id;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onSelect(c.name)}
                className={`inline-flex min-h-[38px] items-center gap-2 rounded-full border pl-2 pr-3.5 text-[0.8125rem] font-semibold transition-colors ${
                  isActive
                    ? "border-[var(--color-text-primary)] bg-[var(--color-bg-surface)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                }`}
              >
                <span
                  className="h-5 w-5 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]"
                  style={{ background: c.hex || colorHex(c.name) }}
                  aria-hidden="true"
                />
                {colorName(c)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Stage */}
        <div
          ref={stageRef}
          className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
        >
          <div className="aspect-square max-h-[640px] w-full sm:aspect-[16/10]">
            {active ? (
              <img
                key={`${color.id}-${active.key}`}
                src={getImageUrl(color.images?.[active.key] ?? undefined)}
                alt={`${title}, ${colorName(color)}, ${label(active)}`}
                className="rise-in h-full w-full object-contain p-[6%]"
              />
            ) : (
              <div className="grid h-full place-items-center p-6 text-center">
                <div>
                  <span
                    className="mx-auto block h-20 w-20 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]"
                    style={{ background: color.hex || colorHex(color.name) }}
                    aria-hidden="true"
                  />
                  <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
                    {isKh ? "មិនទាន់មានរូបភាពសម្រាប់ពណ៌នេះទេ" : "Photos for this colour are coming soon"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {active && (
            <p className="pointer-events-none absolute left-4 top-3.5 text-xs font-semibold uppercase tracking-[0.08em]">
              <span className="tabular text-[var(--color-text-muted)]">
                {pad2(activeIndex + 1)} / {pad2(angles.length)}
              </span>{" "}
              · {label(active)}
            </p>
          )}

          {active && (
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isKh ? "មើលពេញអេក្រង់" : "View fullscreen"}
              className="absolute bottom-2.5 right-2.5 grid h-10 w-10 place-items-center rounded-[10px] bg-[var(--color-bg-primary)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-bg-elevated)]"
            >
              <Maximize className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Angles */}
        {angles.length > 1 && (
          <div className="flex max-w-full items-center gap-2.5">
            <button type="button" onClick={() => step(-1)} aria-label={isKh ? "មុំមុន" : "Previous view"} className={arrowClass}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="scrollbar-hide flex gap-2 overflow-x-auto p-0.5">
              {angles.map((a, i) => {
                const isActive = a.key === active?.key;
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setAngleKey(a.key)}
                    aria-pressed={isActive}
                    className={`flex h-[4.5rem] w-[4.5rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-[10px] border-[1.5px] transition-colors ${
                      isActive
                        ? "border-[var(--color-text-primary)] bg-[var(--color-bg-surface)]"
                        : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                    }`}
                  >
                    <span className="tabular text-[11px] font-semibold text-[var(--color-text-muted)]">{pad2(i + 1)}</span>
                    <span className="whitespace-nowrap text-[11px] font-semibold leading-tight">{label(a)}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => step(1)} aria-label={isKh ? "មុំបន្ទាប់" : "Next view"} className={arrowClass}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ColorShowcase;
