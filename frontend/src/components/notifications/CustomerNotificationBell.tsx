import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useOrders, type Order } from "../../hooks/useOrders";
import { useAuthStore } from "../../stores/authStore";

// Time ago helper
const timeAgo = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Map order status to notification display
const statusConfig = {
  pending: {
    title: "Order Received",
    message: "We're reviewing your order",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  processing: {
    title: "Order Processing",
    message: "We're getting your items ready",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  shipped: {
    title: "Order Shipped",
    message: "Your package is on the way!",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    ),
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  completed: {
    title: "Order Delivered",
    message: "Your order has been completed",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  cancelled: {
    title: "Order Cancelled",
    message: "Your order has been cancelled",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
};

const CustomerNotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Only fetch orders if authenticated
  const { data: orders } = useOrders();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isAuthenticated) return null;

  // Generate notifications from orders
  // We'll treat every order as having a notification based on its current status
  const sortedOrders = [...(orders || [])].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );

  // We could add logic here to track "read" state in local storage,
  // but for simplicity we'll show a badge if there are any recent orders (updated in last 7 days)
  const recentOrders = sortedOrders.filter((o) => {
    const isRecent =
      new Date().getTime() - new Date(o.updated_at).getTime() <
      7 * 24 * 60 * 60 * 1000;
    return isRecent;
  });

  const unreadCount = recentOrders.length;

  const handleNotificationClick = () => {
    setIsOpen(false);
    navigate("/orders");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-all active:scale-95"
        aria-label="Notifications"
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
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 bg-[var(--color-error)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[var(--color-bg-primary)]"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl shadow-2xl shadow-black/20 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-surface)]">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Notifications
              </h3>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {sortedOrders.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-bg-surface)] flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-[var(--color-text-muted)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    No notifications yet
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    When you place an order, updates will appear here.
                  </p>
                </div>
              ) : (
                sortedOrders.slice(0, 5).map((order: Order) => {
                  const config = statusConfig[order.status];
                  return (
                    <button
                      key={order.id}
                      onClick={handleNotificationClick}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[var(--color-bg-surface)] transition-colors text-left border-b border-[var(--color-border)]/50 last:border-0 group"
                    >
                      <div
                        className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full ${config.bg} ${config.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                          {config.title} • #{order.id}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                          {config.message}
                        </p>
                      </div>
                      <span className="text-[10px] text-[var(--color-text-muted)] flex-shrink-0 mt-1">
                        {timeAgo(order.updated_at)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {sortedOrders.length > 0 && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/orders");
                }}
                className="w-full px-4 py-3 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-bg-surface)] transition-colors border-t border-[var(--color-border)] flex items-center justify-center gap-1"
              >
                View all orders
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerNotificationBell;
