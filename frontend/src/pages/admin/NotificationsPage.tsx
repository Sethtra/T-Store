import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  useAdminNotifications,
  type Notification,
} from "../../hooks/useNotifications";

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

const notificationConfig = {
  out_of_stock: {
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
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    ),
    label: "Out of Stock",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  low_stock: {
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
          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    label: "Low Stock",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  new_order: {
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
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
    label: "New Order",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
};

const ITEMS_PER_PAGE = 15;

const NotificationsPage = () => {
  const { data, isLoading } = useAdminNotifications();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>("all");

  // Scroll to top when page changes
  useEffect(() => {
    const el = document.getElementById("admin-main-content");
    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const allNotifications = data?.notifications ?? [];

  // Filter notifications
  const filteredNotifications =
    filter === "all"
      ? allNotifications
      : allNotifications.filter((n) => n.type === filter);

  // Pagination
  const totalItems = filteredNotifications.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedNotifications = filteredNotifications.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter]);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === "new_order" && notification.order_id) {
      navigate(`/admin/orders/${notification.order_id}`);
    } else {
      navigate("/admin/products");
    }
  };

  const filterButtons = [
    { key: "all", label: "All", count: allNotifications.length },
    {
      key: "out_of_stock",
      label: "Out of Stock",
      count: data?.counts.out_of_stock ?? 0,
      color: "text-red-400",
      activeBg: "bg-red-500/20",
    },
    {
      key: "low_stock",
      label: "Low Stock",
      count: data?.counts.low_stock ?? 0,
      color: "text-yellow-400",
      activeBg: "bg-yellow-500/20",
    },
    {
      key: "new_order",
      label: "New Orders",
      count: data?.counts.new_orders ?? 0,
      color: "text-blue-400",
      activeBg: "bg-blue-500/20",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Notifications
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Monitor stock alerts and new orders
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === btn.key
                  ? btn.activeBg
                    ? `${btn.activeBg} ${btn.color}`
                    : "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] border border-[var(--color-border)]"
              }`}
            >
              {btn.label}
              {btn.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    filter === btn.key
                      ? "bg-white/20"
                      : "bg-[var(--color-bg-surface)]"
                  }`}
                >
                  {btn.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notification List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-[var(--color-bg-elevated)] rounded-xl p-4 border border-[var(--color-border)] animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-bg-surface)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-[var(--color-bg-surface)]" />
                    <div className="h-3 w-32 rounded bg-[var(--color-bg-surface)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : paginatedNotifications.length === 0 ? (
          <div className="bg-[var(--color-bg-elevated)] rounded-xl p-12 text-center border border-[var(--color-border)]">
            <svg
              className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-3"
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
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
              All clear!
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              No notifications to show
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {paginatedNotifications.map((notification) => {
              const config = notificationConfig[notification.type];
              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl bg-[var(--color-bg-elevated)] border ${config.border} hover:bg-[var(--color-bg-surface)] transition-all text-left group`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bg} ${config.color} flex items-center justify-center`}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                        {notification.title}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${config.bg} ${config.color} font-medium flex-shrink-0`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {notification.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {timeAgo(notification.created_at)}
                    </span>
                    <svg
                      className="w-4 h-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
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
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {/* Previous */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] disabled:opacity-30 hover:bg-[var(--color-bg-surface)] transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Current page */}
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-sm font-semibold">
              {page}
            </div>

            {/* Next page number */}
            {page < totalPages && (
              <button
                onClick={() => setPage(page + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-colors text-sm"
              >
                {page + 1}
              </button>
            )}

            {/* Ellipsis + last page */}
            {totalPages > page + 2 && (
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-text-muted)] text-xs tracking-widest">
                  •••
                </span>
                <button
                  onClick={() => setPage(totalPages)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-colors text-sm"
                >
                  {totalPages}
                </button>
              </div>
            )}

            {/* Next */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] disabled:opacity-30 hover:bg-[var(--color-bg-surface)] transition-colors"
            >
              <svg
                className="w-4 h-4"
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
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default NotificationsPage;
