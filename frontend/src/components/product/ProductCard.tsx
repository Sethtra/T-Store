import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCartStore } from "../../stores/cartStore";
import Button from "../ui/Button";

interface ProductCardProps {
  id: number;
  slug: string;
  title: string;
  price: number;
  image: string;
  category?: string;
  stock?: number;
}

const ProductCard = ({
  id,
  slug,
  title,
  price,
  image,
  category,
  stock,
}: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const handleAddToCart = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addItem({ id, slug, title, price, image });
    openCart();
  };

  const isOutOfStock = (stock ?? 0) <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link to={`/products/${slug}`} className="block">
        <div className="relative bg-[var(--color-bg-elevated)] rounded-2xl overflow-hidden border border-[var(--color-border)] transition-all duration-500 hover:border-[var(--color-primary)]/30 hover:shadow-2xl hover:shadow-[var(--color-primary)]/10">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-surface)]">
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

            <motion.img
              src={image}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />

            {/* Category Badge */}
            {category && (
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute top-3 left-3 px-3 py-1 text-xs font-medium bg-black/40 backdrop-blur-md text-white rounded-full border border-white/10 z-20"
              >
                {category}
              </motion.span>
            )}

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30"
              >
                <span className="text-white font-semibold text-lg px-4 py-2 bg-black/50 rounded-full border border-white/20">
                  Out of Stock
                </span>
              </motion.div>
            )}

            {/* Quick Add Button */}
            {!isOutOfStock && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
              >
                <motion.div
                  initial={{ y: 20 }}
                  whileInView={{ y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    onClick={handleAddToCart}
                    fullWidth
                    className="shadow-xl backdrop-blur-md bg-[var(--color-primary)]/90 hover:bg-[var(--color-primary)]"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add to Cart
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* Wishlist Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Title */}
            <motion.h3 className="font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors duration-300">
              {title}
            </motion.h3>

            {/* Price Row */}
            <div className="flex items-center justify-between mt-3">
              <motion.p
                className="text-xl font-bold"
                whileHover={{ scale: 1.05 }}
              >
                <span className="gradient-text">
                  ${Number(price).toFixed(2)}
                </span>
              </motion.p>

              {/* Stock Indicator */}
              {stock && stock > 0 && stock <= 5 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-[var(--color-warning)] bg-[var(--color-warning)]/10 px-2 py-1 rounded-full"
                >
                  Only {stock} left
                </motion.span>
              )}
            </div>

            {/* Rating Stars (placeholder) */}
            <div className="flex items-center gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.svg
                  key={star}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: star * 0.05 }}
                  className="w-4 h-4 text-amber-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </motion.svg>
              ))}
              <span className="text-xs text-[var(--color-text-muted)] ml-1">
                (4.9)
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
