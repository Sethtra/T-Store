import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, Plus } from "lucide-react";
import { getImageUrl } from "../../utils/image";
import { formatUSD, getDiscount } from "../../utils/money";
import { colorHex, getAttributeValues, type RawAttributes } from "../../utils/attributes";
import { useCartStore } from "../../stores/cartStore";

interface ProductCardProps {
  id: number;
  slug: string;
  title: string;
  title_kh?: string;
  price: number;
  /** Optional "was" price; shows the OFF tag, struck price and saving when above price. */
  original_price?: number | string | null;
  image: string;
  category?: string;
  category_kh?: string;
  stock?: number;
  /** Colour/size options; colours become swatches, sizes send the shopper to the product page. */
  attributes?: RawAttributes;
  /** Accepted for API compatibility; not shown on the card. */
  description?: string;
  description_kh?: string;
}

/**
 * PLACEHOLDER: no product has key specs in the admin yet. Every card shows
 * these until a specs field exists; then pass real values instead.
 */
const PLACEHOLDER_SPECS = [
  { value: '6.83"', label: "AMOLED" },
  { value: "165Hz", label: "Refresh" },
  { value: "7400mAh", label: "Battery" },
];

const MAX_SWATCHES = 4;

/**
 * Card 1c: photo with a hover/focus reveal (3 specs + add to cart), then
 * category and swatches, name and price, and the chosen colour.
 * Touch screens get a round quick-add button on the photo instead of the reveal.
 */
const ProductCard = ({
  id,
  slug,
  title,
  title_kh,
  price,
  original_price,
  image,
  category,
  category_kh,
  stock,
  attributes,
}: ProductCardProps) => {
  const { i18n } = useTranslation();
  const isKh = i18n.language === "kh";
  const addItem = useCartStore((s) => s.addItem);

  const displayTitle = isKh && title_kh ? title_kh : title;
  const displayCategory = isKh && category_kh ? category_kh : category;
  const isOutOfStock = (stock ?? 0) <= 0;
  const isLowStock = !isOutOfStock && (stock ?? 0) <= 5;
  const discount = getDiscount(price, original_price);
  const colors = getAttributeValues(attributes, "color");
  const needsOptions = getAttributeValues(attributes, "size").length > 0;
  const href = `/products/${slug}`;

  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleAdd = () => {
    addItem({
      id,
      slug,
      title,
      price,
      image,
      attributes: selectedColor ? { Color: selectedColor } : {},
    });
    setJustAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setJustAdded(false), 1400);
  };

  const label = isOutOfStock
    ? isKh ? "អស់ពីស្តុក" : "Sold out"
    : justAdded
      ? isKh ? "បានបញ្ចូលកន្ត្រក" : "Added to cart"
      : needsOptions
        ? isKh ? "ជ្រើសរើសជម្រើស" : "Choose options"
        : isKh ? "បញ្ចូលកន្ត្រក" : "Add to cart";

  const addClass =
    "flex min-h-[38px] w-full items-center justify-center gap-1.5 bg-[var(--color-primary)] px-3 text-[0.8125rem] font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)] active:opacity-90 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[var(--color-on-primary)] disabled:cursor-not-allowed disabled:opacity-45";

  return (
    <article className="@container group relative flex h-full flex-col overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] transition-[border-color,box-shadow] duration-200 hover:border-[var(--color-border-hover)] hover:shadow-[var(--shadow-md)]">
      {/* Media */}
      <div className="relative aspect-[4/5] overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <img
            src={getImageUrl(image)}
            alt=""
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-contain p-[9%] transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.04] ${
              isOutOfStock ? "opacity-45 grayscale" : ""
            }`}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpg";
              e.currentTarget.onerror = null;
            }}
          />

        {discount && !isOutOfStock && (
          <span className="tabular pointer-events-none absolute right-0 top-0 flex min-w-[3.25rem] flex-col items-center rounded-bl-[10px] bg-[var(--color-primary)] px-2 py-1.5 text-[11px] font-bold leading-[1.15] text-[var(--color-on-primary)]">
            <span>{discount.percent}%</span>
            <span>{isKh ? "បញ្ចុះ" : "OFF"}</span>
          </span>
        )}

        {isOutOfStock && (
          <span className="pointer-events-none absolute left-2 top-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-primary)] px-2 py-1 text-xs font-semibold shadow-[var(--shadow-sm)]">
            {isKh ? "អស់ពីស្តុក" : "Sold out"}
          </span>
        )}

        {/* Reveal panel: pointer devices with hover, or keyboard focus inside the card */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] transition-transform duration-[220ms] ease-[var(--ease-out)] group-hover:translate-y-0 group-focus-within:translate-y-0 motion-reduce:transition-none [@media(hover:none)]:hidden">
          <dl className="grid grid-cols-3 px-3">
            {PLACEHOLDER_SPECS.map((spec, i) => (
              <div
                key={spec.label}
                className={`flex min-w-0 flex-col-reverse gap-px py-2 ${i > 0 ? "border-l border-[var(--color-border)] pl-2" : ""}`}
              >
                <dt className="truncate text-[10px] leading-tight text-[var(--color-text-muted)]">{spec.label}</dt>
                <dd className="tabular truncate text-[0.9375rem] font-semibold leading-[1.1] tracking-[-0.01em]">{spec.value}</dd>
              </div>
            ))}
          </dl>
          {needsOptions && !isOutOfStock ? (
            <Link to={href} className={addClass}>
              {label}
            </Link>
          ) : (
            <button type="button" onClick={handleAdd} disabled={isOutOfStock} aria-live="polite" className={addClass}>
              {justAdded && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
              {label}
            </button>
          )}
        </div>

        {/* Touch screens: quick add on the photo */}
        {!isOutOfStock &&
          (needsOptions ? (
            <Link
              to={href}
              aria-label={`${label}: ${displayTitle}`}
              className="absolute bottom-2 right-2 z-10 hidden h-9 w-9 place-items-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-md)] [@media(hover:none)]:grid"
            >
              <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`${label}: ${displayTitle}`}
              className="absolute bottom-2 right-2 z-10 hidden h-9 w-9 place-items-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-md)] transition-transform active:scale-95 [@media(hover:none)]:grid"
            >
              {justAdded ? <Check className="h-[18px] w-[18px]" aria-hidden="true" /> : <Plus className="h-[18px] w-[18px]" aria-hidden="true" />}
            </button>
          ))}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-2.5">
        <div className="flex min-h-[18px] items-center justify-between gap-3">
          <span className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            {displayCategory}
            {selectedColor && (
              <span className="font-medium normal-case tracking-normal text-[var(--color-text-muted)]">
                {displayCategory ? " · " : ""}
                {selectedColor}
              </span>
            )}
          </span>
          {colors.length > 0 && (
            <div className="relative z-10 flex shrink-0 items-center gap-1.5" role="group" aria-label={isKh ? "ព័ណ៌" : "Colour"}>
              {colors.slice(0, MAX_SWATCHES).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  aria-label={c}
                  aria-pressed={selectedColor === c}
                  title={c}
                  className={`relative h-[14px] w-[14px] rounded-full border p-[2px] transition-colors before:absolute before:-inset-[7px] before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text-primary)] ${
                    selectedColor === c ? "border-[var(--color-text-primary)]" : "border-[var(--color-border-hover)]"
                  }`}
                >
                  <span className="block h-full w-full rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]" style={{ background: colorHex(c) }} />
                </button>
              ))}
              {colors.length > MAX_SWATCHES && (
                <span className="text-[10px] font-medium text-[var(--color-text-muted)]">+{colors.length - MAX_SWATCHES}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-0.5 @min-[210px]:flex-row @min-[210px]:items-start @min-[210px]:justify-between @min-[210px]:gap-3">
          <h3 className="min-w-0 text-[0.9375rem] font-semibold leading-snug" title={displayTitle}>
            <Link to={href} className="line-clamp-2 after:absolute after:inset-0 after:rounded-[12px] after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-[var(--color-text-primary)]">
              {displayTitle}
            </Link>
          </h3>
          <div className="flex shrink-0 items-baseline gap-2 @min-[210px]:block @min-[210px]:text-right">
            <p className="tabular text-[0.9375rem] font-bold leading-snug">{formatUSD(price)}</p>
            {discount && (
              <p className="tabular text-[0.75rem] text-[var(--color-text-muted)] line-through">{formatUSD(discount.original)}</p>
            )}
          </div>
        </div>

        {(discount && !isOutOfStock) || isLowStock ? (
        <div className="mt-auto flex items-center justify-end gap-3 pt-0.5 text-[11px]">
          {discount && !isOutOfStock ? (
            <span className="tabular shrink-0 font-semibold text-[var(--color-success)]">
              {isKh ? "សន្សំ" : "Save"} {formatUSD(discount.save)}
            </span>
          ) : isLowStock ? (
            <span className="shrink-0 font-semibold text-[var(--color-warning)]">
              {isKh ? `នៅសល់តែ ${stock}` : `Only ${stock} left`}
            </span>
          ) : null}
        </div>
        ) : null}
      </div>
    </article>
  );
};

export default ProductCard;
