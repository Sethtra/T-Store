import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, type CartItem } from "../../stores/cartStore";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const CartDrawer = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold">Shopping Cart</h2>
              <button
                onClick={closeCart}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                aria-label="Close Cart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-[var(--color-text-muted)] mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <p className="text-[var(--color-text-muted)] mb-4">
                    Your cart is empty
                  </p>
                  <Button onClick={closeCart} variant="outline">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onRemove={() => removeItem(item.id)}
                      onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-[var(--color-border)] space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-[var(--color-text-secondary)]">
                    Subtotal
                  </span>
                  <span className="font-bold">${totalPrice().toFixed(2)}</span>
                </div>
                <Link to="/checkout" onClick={closeCart}>
                  <Button fullWidth size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
                <p className="text-center text-sm text-[var(--color-text-muted)]">
                  Shipping and taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Cart Item Component
interface CartItemCardProps {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

const CartItemCard = ({
  item,
  onRemove,
  onUpdateQuantity,
}: CartItemCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="flex gap-4 p-3 bg-[var(--color-bg-elevated)] rounded-xl"
    >
      {/* Image */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-[var(--color-bg-surface)] flex-shrink-0">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{item.title}</h4>
        <p className="text-[var(--color-primary)] font-medium mt-1">
          ${Number(item.price).toFixed(2)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            -
          </button>
          <span className="w-8 text-center text-sm font-medium">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors self-start"
        aria-label="Remove Item"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </motion.div>
  );
};

export default CartDrawer;
