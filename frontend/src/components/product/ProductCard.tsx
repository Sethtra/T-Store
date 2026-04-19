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
    <div className="group will-change-transform transition-transform duration-300 ease-out hover:-translate-y-3">
      <Link to={`/products/${slug}`} className="block">
        <div className="relative bg-[var(--color-bg-elevated)] rounded-2xl overflow-hidden border border-[var(--color-border)] transition-[border-color,box-shadow] duration-300 hover:border-[var(--color-primary)]/30 hover:shadow-lg hover:shadow-[var(--color-primary)]/10">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-surface)]">
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

            <img
              src={getImageUrl(image)}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain p-4 will-change-transform transition-transform duration-500 ease-out group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg";
                e.currentTarget.onerror = null;
              }}
            />

            {/* Category Badge */}
            {displayCategory && (
              <span className="absolute top-3 left-3 px-3 py-1 text-xs font-medium bg-black/60 text-white rounded-full border border-white/10 z-20 shadow-sm">
                {displayCategory}
              </span>
            )}

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
                <span className="text-white font-semibold text-lg px-4 py-2 bg-black/60 rounded-full border border-white/20 shadow-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title */}
            <h3 className="font-bold text-lg leading-snug text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
              {displayTitle}
            </h3>

            {/* Description */}
            {displayDescription && (
              <p className="text-sm text-[var(--color-text-muted)] mt-1.5 line-clamp-2">
                {displayDescription}
              </p>
            )}

            {/* Price Row */}
            <div className="flex items-center justify-between mt-3">
              <p className="text-xl font-bold inline-block origin-left">
                <span className="gradient-text">
                  ${Number(price).toFixed(2)}
                </span>
              </p>

              {/* Stock Indicator */}
              {stock && stock > 0 && stock <= 5 && (
                <span className="text-xs text-[var(--color-warning)] bg-[var(--color-warning)]/10 px-2 py-1 rounded-full">
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
