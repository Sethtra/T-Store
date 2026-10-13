import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCartStore, type CartItem } from "../../stores/cartStore";
import { getImageUrl } from "../../utils/image";
import { formatUSD } from "../../utils/money";

const CartDrawer = () => {
  const { t, i18n } = useTranslation();
  const isKh = i18n.language === "kh";
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore();

  // Esc to close, and keep the page from scrolling underneath
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  const count = totalItems();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 z-[90] bg-black/40"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[91] flex h-full w-full max-w-[440px] flex-col bg-[var(--color-bg-elevated)] shadow-[var(--shadow-lg)]"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 pt-[env(safe-area-inset-top)]">
              <h2 id="cart-title" className="text-lg font-semibold">
                {t("cart.title")}
                {count > 0 && <span className="tabular ml-2 font-normal text-[var(--color-text-muted)]">({count})</span>}
              </h2>
              <button
                type="button"
                onClick={closeCart}
                className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-bg-surface)]">
                  <ShoppingBag className="h-6 w-6 text-[var(--color-text-secondary)]" />
                </span>
                <p className="mt-4 font-semibold">{t("cart.empty")}</p>
                <Link
                  to="/products"
                  onClick={closeCart}
                  className="mt-6 inline-flex h-11 items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-on-primary)]"
                >
                  {t("cart.continue_shopping")}
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-[var(--color-border)] overflow-y-auto overscroll-contain px-5">
                  {items.map((item) => (
                    <CartRow
                      key={`${item.id}-${JSON.stringify(item.attributes || {})}`}
                      item={item}
                      onClose={closeCart}
                      onRemove={() => removeItem(item.id, item.attributes)}
                      onUpdateQuantity={(qty) => updateQuantity(item.id, qty, item.attributes)}
                    />
                  ))}
                </ul>

                <div className="shrink-0 space-y-3 border-t border-[var(--color-border)] px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[var(--color-text-secondary)]">{t("cart.subtotal")}</span>
                    <span className="tabular text-lg font-semibold">{formatUSD(totalPrice())}</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {isKh ? "ថ្លៃដឹកជញ្ជូនត្រូវបានគណនានៅពេលទូទាត់ប្រាក់" : "Delivery is calculated at checkout."}
                  </p>
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] font-semibold text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)]"
                  >
                    {t("cart.checkout")}
                  </Link>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="w-full py-1 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  >
                    {t("cart.continue_shopping")}
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

interface CartRowProps {
  item: CartItem;
  onClose: () => void;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

const CartRow = ({ item, onClose, onRemove, onUpdateQuantity }: CartRowProps) => {
  const attrs = item.attributes ? Object.entries(item.attributes) : [];

  return (
    <li className="flex gap-4 py-5">
      <Link
        to={`/products/${item.slug}`}
        onClick={onClose}
        className="h-24 w-24 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]"
      >
        <img src={getImageUrl(item.image)} alt="" className="h-full w-full object-contain p-2" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/products/${item.slug}`}
            onClick={onClose}
            className="line-clamp-2 text-[0.9375rem] font-medium leading-snug hover:underline underline-offset-4"
          >
            {item.title}
          </Link>
          <p className="tabular shrink-0 text-[0.9375rem] font-semibold">{formatUSD(item.price * item.quantity)}</p>
        </div>
        {attrs.length > 0 && (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {attrs.map(([k, v]) => `${k}: ${v}`).join(" · ")}
          </p>
        )}
        {item.quantity > 1 && (
          <p className="tabular mt-0.5 text-sm text-[var(--color-text-muted)]">{formatUSD(item.price)} each</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="inline-flex h-9 items-center rounded-[var(--radius-md)] border border-[var(--color-border-hover)]">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              aria-label="Decrease quantity"
              className="grid h-full w-9 place-items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="tabular w-7 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              aria-label="Increase quantity"
              className="grid h-full w-9 place-items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] px-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Remove</span>
          </button>
        </div>
      </div>
    </li>
  );
};

export default CartDrawer;
