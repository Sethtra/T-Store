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
  stock: number;
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

  const isOutOfStock = stock <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link to={`/products/${slug}`} className="block">
        <div className="relative bg-[var(--color-bg-elevated)] rounded-2xl overflow-hidden border border-[var(--color-border)] transition-all duration-300 hover:border-[var(--color-border-hover)] hover:shadow-lg">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-surface)]">
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Quick Add Button - Appears on Hover */}
            {!isOutOfStock && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <Button
                  onClick={handleAddToCart}
                  fullWidth
                  className="shadow-lg"
                >
                  Add to Cart
                </Button>
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {category && (
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                {category}
              </p>
            )}
            <h3 className="font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors">
              {title}
            </h3>
            <p className="mt-2 text-lg font-bold text-[var(--color-primary)]">
              ${Number(price).toFixed(2)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
