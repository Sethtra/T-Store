import React from "react";
import { useNavigate } from "react-router-dom";
import { type Order } from "../../hooks/useOrders";
import NotificationItem from "./NotificationItem";

interface NotificationListProps {
  orders: Order[];
  onItemClick?: () => void;
  maxHeight?: string;
}

const NotificationList: React.FC<NotificationListProps> = ({
  orders,
  onItemClick,
  maxHeight = "320px",
}) => {
  const navigate = useNavigate();

  const sortedOrders = [...(orders || [])].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const handleItemClick = () => {
    if (onItemClick) onItemClick();
    navigate("/orders");
  };

  return (
    <div className="flex flex-col bg-[var(--color-bg-elevated)] overflow-hidden">
      {/* List Area */}
      <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight }}>
        {sortedOrders.length === 0 ? (
          <div className="px-4 py-8 text-center bg-[var(--color-bg-surface)]">
            <div className="w-12 h-12 rounded-full bg-[var(--color-bg-surface)]/50 border border-[var(--color-border)] flex items-center justify-center mx-auto mb-3">
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
          sortedOrders.slice(0, 10).map((order) => (
            <NotificationItem
              key={order.id}
              order={order}
              onClick={() => handleItemClick(order.id)}
            />
          ))
        )}
      </div>

      {/* Footer Link */}
      {sortedOrders.length > 0 && (
        <button
          onClick={() => {
            if (onItemClick) onItemClick();
            navigate("/orders");
          }}
          className="w-full px-4 py-3 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-bg-surface)] transition-colors border-t border-[var(--color-border)] flex items-center justify-center gap-1.5 group"
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
    </div>
  );
};

export default NotificationList;
