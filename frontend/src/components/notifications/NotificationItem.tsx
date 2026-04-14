import React from "react";
import { type Order } from "../../hooks/useOrders";
import { timeAgo } from "../../utils/time";

// Map order status to notification display
const statusConfig = {
  pending: {
    title: "Order Received",
    message: "We're reviewing your order",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  processing: {
    title: "Order Processing",
    message: "We're getting your items ready",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  shipped: {
    title: "Order Shipped",
    message: "Your package is on the way!",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  completed: {
    title: "Order Delivered",
    message: "Your order has been completed",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  cancelled: {
    title: "Order Cancelled",
    message: "Your order has been cancelled",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
};

interface NotificationItemProps {
  order: Order;
  onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ order, onClick }) => {
  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <button
      onClick={onClick}
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
};

export default NotificationItem;
