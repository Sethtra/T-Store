import { motion, AnimatePresence } from "framer-motion";
import { type Order } from "../../hooks/useOrders";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailsModal = ({
  isOpen,
  onClose,
  order,
}: OrderDetailsModalProps) => {
  if (!isOpen || !order) return null;

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "primary";
      case "shipped":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-bg-primary)] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-secondary)]">
                <div>
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    #{order.id}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusColor(order.status) as any}>
                    {order.status.toUpperCase()}
                  </Badge>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-[var(--color-bg-elevated)] rounded-full transition-colors"
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
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                {/* Date & Tracking */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl">
                    <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold tracking-wider mb-1">
                      Order Date
                    </p>
                    <p className="font-medium">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {order.tracking_id && (
                    <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl">
                      <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold tracking-wider mb-1">
                        Tracking ID
                      </p>
                      <p className="font-mono">{order.tracking_id}</p>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                  Items
                </h3>
                <div className="space-y-4 mb-8">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 bg-[var(--color-bg-surface)] p-3 rounded-2xl border border-[var(--color-border)]"
                    >
                      <div className="w-16 h-16 bg-white rounded-xl flex-shrink-0 flex items-center justify-center p-2 overflow-hidden border border-gray-100">
                        {item.product?.image_url ||
                        item.product?.images?.[0] ? (
                          <img
                            src={
                              item.product.image_url || item.product.images?.[0]
                            }
                            alt={item.product_title}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm md:text-base line-clamp-1">
                          {item.product_title}
                        </h4>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          Qty: {item.quantity} × $
                          {Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="font-bold">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-[var(--color-bg-Secondary)] p-6 rounded-3xl space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">
                      Subtotal
                    </span>
                    <span>${Number(order.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">
                      Shipping
                    </span>
                    <span>Free</span>
                  </div>
                  <div className="h-px bg-[var(--color-border)] my-2"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[var(--color-primary)]">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OrderDetailsModal;
