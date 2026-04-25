import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/image";
import { useTranslation } from "react-i18next";

interface ProductCardProps {
  id: number;
  slug: string;
  title: string;
  title_kh?: string;
  price: number;
  image: string;
  category?: string;
  category_kh?: string;
  stock?: number;
  description?: string;
  description_kh?: string;
}

const ProductCard = ({
  slug,
  title,
  title_kh,
  price,
  image,
  category,
  category_kh,
  stock,
  description,
  description_kh,
}: ProductCardProps) => {
  const { i18n } = useTranslation();
  const isKh = i18n.language === "kh";
  const displayTitle = isKh && title_kh ? title_kh : title;
  const displayDescription = isKh && description_kh ? description_kh : description;
  const displayCategory = isKh && category_kh ? category_kh : category;
  const isOutOfStock = (stock ?? 0) <= 0;

  return (
    <div className="group h-full will-change-transform transition-transform duration-300 ease-out hover:-translate-y-2">
      <Link to={`/products/${slug}`} className="block h-full">
        <div className="relative h-full flex flex-col bg-[var(--color-bg-elevated)] rounded-2xl md:rounded-[1.5rem] overflow-hidden border border-[var(--color-border)] transition-[border-color,box-shadow] duration-300 hover:border-[var(--color-primary)]/40 hover:shadow-xl hover:shadow-[var(--color-primary)]/10">
          {/* Image Container */}
          <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-[var(--color-bg-surface)] shrink-0">
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

            <img
              src={getImageUrl(image)}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain p-3 sm:p-4 will-change-transform transition-transform duration-500 ease-out group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg";
                e.currentTarget.onerror = null;
              }}
            />

            {/* Category Badge */}
            {displayCategory && (
              <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wide bg-black/60 backdrop-blur-md text-white rounded-full border border-white/10 z-20 shadow-sm">
                {displayCategory}
              </span>
            )}

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30 backdrop-blur-sm">
                <span className="text-white font-semibold text-sm sm:text-lg px-4 py-2 bg-black/60 rounded-full border border-white/20 shadow-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-4 sm:p-5">
            {/* Title */}
            <h3 className="font-bold text-[15px] sm:text-base leading-snug text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors duration-300 line-clamp-2" title={displayTitle}>
              {displayTitle}
            </h3>

            {/* Description */}
            {displayDescription && (
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-2 line-clamp-2">
                {displayDescription}
              </p>
            )}

            {/* Price Row (Pushed to bottom) */}
            <div className="flex items-center justify-between mt-auto pt-4">
              <p className="text-lg sm:text-xl font-bold inline-block origin-left">
                <span className="text-[var(--color-primary)] drop-shadow-sm">
                  ${Number(price).toFixed(2)}
                </span>
              </p>

              {/* Stock Indicator */}
              {stock && stock > 0 && stock <= 5 && (
                <span className="text-[10px] sm:text-xs font-medium text-[var(--color-warning)] bg-[var(--color-warning)]/10 px-2 py-1 rounded-full border border-[var(--color-warning)]/20">
                  Only {stock} left
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
