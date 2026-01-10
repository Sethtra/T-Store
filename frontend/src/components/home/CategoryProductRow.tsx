import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../../stores/cartStore";
import type { Product } from "../../hooks/useProducts";

interface CategoryProductRowProps {
  title: string;
  bannerTitle?: string;
  bannerTextColor?: string;
  products: Product[];
  categorySlug?: string;
  showHero?: boolean;
  bannerImage?: string;
}

const CategoryProductRow = ({
  title,
  bannerTitle,
  bannerTextColor,
  products,
  categorySlug,
  showHero = false,
  bannerImage,
}: CategoryProductRowProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const displayBannerTitle = bannerTitle || title;
  const textColorStyle = bannerTextColor ? { color: bannerTextColor } : {};

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: Number(product.price),
      image: product.images?.[0] || "/placeholder.png",
    });
    openCart();
  };

  if (!products || products.length === 0) return null;

  // If showing hero (banner), show all products in the scroll row
  // Otherwise show defaults
  const rowProducts = showHero ? products.slice(0, 8) : products.slice(0, 6);

  return (
    <div className="bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Banner Section (Left Side) */}
        {showHero && (
          <div className="lg:w-80 flex-shrink-0 relative overflow-hidden group">
            <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/30 transition-colors" />
            <AnimatePresence mode="wait">
              <motion.img
                key={bannerImage}
                src={bannerImage || "/placeholder.png"}
                alt={displayBannerTitle}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 absolute inset-0"
              />
            </AnimatePresence>
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 text-white">
              <h3
                className="text-3xl font-bold mb-2 text-white"
                style={textColorStyle}
              >
                {displayBannerTitle}
              </h3>
              <p className="text-white/80 mb-6">
                Explore our latest collection of {title.toLowerCase()}.
              </p>
              {categorySlug && (
                <Link
                  to={`/products?category=${categorySlug}`}
                  className="px-6 py-3 bg-white text-black font-semibold rounded-lg text-center hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                >
                  View Collection
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Products Row */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              {title}
            </h2>
            {categorySlug && (
              <Link
                to={`/products?category=${categorySlug}`}
                className="text-sm font-medium text-[var(--color-primary)] hover:underline flex items-center gap-1"
              >
                View all <span>→</span>
              </Link>
            )}
          </div>

          {/* Horizontal Scroll Container */}
          <div className="relative group/scroll">
            {/* Scroll Buttons */}
            <button
              onClick={() => {
                const container = document.getElementById(
                  `scroll-container-${title.replace(/\s+/g, "-").toLowerCase()}`
                );
                if (container) {
                  container.scrollBy({ left: -300, behavior: "smooth" });
                }
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-300 hover:bg-white hover:scale-110"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              onClick={() => {
                const container = document.getElementById(
                  `scroll-container-${title.replace(/\s+/g, "-").toLowerCase()}`
                );
                if (container) {
                  container.scrollBy({ left: 300, behavior: "smooth" });
                }
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-300 hover:bg-white hover:scale-110"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>

            <div
              id={`scroll-container-${title
                .replace(/\s+/g, "-")
                .toLowerCase()}`}
              className="overflow-x-auto scrollbar-hide scroll-smooth"
            >
              <div className="flex gap-6 p-6 min-w-max">
                {rowProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -5 }}
                    className="w-72 flex-shrink-0"
                  >
                    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[var(--color-primary)]/10 group relative">
                      <Link
                        to={`/products/${product.slug}`}
                        className="block relative overflow-hidden"
                      >
                        <div className="aspect-[4/3] p-6 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                          <motion.img
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.title}
                            className="w-full h-full object-contain mix-blend-multiply"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          />
                          {/* Sold Badge */}
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-medium text-[var(--color-text-muted)] shadow-sm border border-gray-100/50">
                            {product.sold ?? 0} sold
                          </div>
                        </div>
                      </Link>

                      <div className="p-5 flex flex-col flex-1">
                        <Link
                          to={`/products/${product.slug}`}
                          className="block mb-3 text-left"
                        >
                          <h3 className="text-base font-semibold text-[var(--color-text-primary)] leading-tight line-clamp-2 min-h-[2.5em] group-hover:text-[var(--color-primary)] transition-colors">
                            {product.title}
                          </h3>
                        </Link>

                        <div className="mt-auto flex items-center justify-between gap-2">
                          <span className="text-xl font-bold text-[var(--color-text-primary)]">
                            ${Number(product.price).toFixed(2)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(product);
                            }}
                            className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] hover:bg-[var(--color-primary)] text-[var(--color-text-primary)] hover:text-white flex items-center justify-center transition-colors shadow-sm"
                            title="Add to cart"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                              <path d="M3 6h18" />
                              <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProductRow;
