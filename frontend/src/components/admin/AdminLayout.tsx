import { type ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { useAdminNotifications } from "../../hooks/useNotifications";
import { AnimatePresence, motion } from "framer-motion";
import Button from "../../components/ui/Button";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
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
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Products",
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
  },
  {
    href: "/admin/orders",
    label: "Orders",
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
  },
  {
    href: "/admin/categories",
    label: "Categories",
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
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
  },
  {
    href: "/admin/notifications",
    label: "Notifications",
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
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
  },
  {
    label: "Storefront",
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
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
    children: [
      {
        href: "/admin/landing",
        label: "Landing Page",
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        ),
      },
      {
        href: "/admin/category-display",
        label: "Category Display",
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        ),
      },
      {
        href: "/admin/banners",
        label: "Banners",
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ),
      },
    ],
  },
];

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

// Notification type config
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
    color: "text-red-400",
    bg: "bg-red-500/10",
    dot: "bg-red-500",
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
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    dot: "bg-yellow-500",
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
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    dot: "bg-blue-500",
  },
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data } = useAdminNotifications();

  const totalCount = data?.counts.total ?? 0;

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

  const handleNotificationClick = (notification: {
    type: string;
    product_id?: number;
    order_id?: number;
  }) => {
    setIsOpen(false);
    if (notification.type === "new_order" && notification.order_id) {
      navigate(`/admin/orders/${notification.order_id}`);
    } else {
      navigate("/admin/products");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-surface)] transition-all"
      >
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-[var(--color-bg-secondary)]">
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
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
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl shadow-2xl shadow-black/20 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Notifications
                </h3>
                {totalCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-medium">
                    {totalCount} alert{totalCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Category counts */}
              {data && totalCount > 0 && (
                <div className="flex gap-3 mt-2">
                  {data.counts.out_of_stock > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                      {data.counts.out_of_stock} out of stock
                    </span>
                  )}
                  {data.counts.low_stock > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
                      {data.counts.low_stock} low stock
                    </span>
                  )}
                  {data.counts.new_orders > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                      {data.counts.new_orders} new order
                      {data.counts.new_orders !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {!data || totalCount === 0 ? (
                <div className="px-4 py-8 text-center">
                  <svg
                    className="w-10 h-10 mx-auto text-[var(--color-text-muted)] mb-2"
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
                  <p className="text-sm text-[var(--color-text-muted)]">
                    All clear! No alerts.
                  </p>
                </div>
              ) : (
                data.notifications.slice(0, 5).map((notification) => {
                  const config = notificationConfig[notification.type];
                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[var(--color-bg-surface)] transition-colors text-left border-b border-[var(--color-border)] last:border-b-0"
                    >
                      <div
                        className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full ${config.bg} ${config.color} flex items-center justify-center`}
                      >
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-[10px] text-[var(--color-text-muted)] flex-shrink-0 mt-0.5">
                        {timeAgo(notification.created_at)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* See More Footer */}
            {totalCount > 0 && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/admin/notifications");
                }}
                className="w-full px-4 py-3 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-bg-surface)] transition-colors border-t border-[var(--color-border)] flex items-center justify-center gap-1"
              >
                See all notifications
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (href: string) => {
    // Exact match for root admin to avoid double active state
    if (href === "/admin") {
      return location.pathname === href;
    }
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  const toggleMenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)] overflow-hidden font-sans">
      {/* Sidebar - Theme-aware Style */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="w-[280px] bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col z-20 shadow-xl"
      >
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-[var(--color-border)]">
          <Link to="/admin" className="flex items-center gap-3 group">
            {/* T-Store Logo */}
            <div className="w-10 h-10 bg-gradient-to-tr from-[#3454d1] to-[#6610f2] rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-xl font-sans">T</span>
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-[var(--color-text-primary)]">
                T-Store
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
                Admin Dashboard
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {/* Navigation Label */}
          <div className="px-4 pb-2">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">
              Navigation
            </span>
          </div>

          {navItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <div className="space-y-1 mt-1">
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-200 group rounded-md ${
                      expandedMenu === item.label
                        ? "text-[var(--color-text-primary)] bg-[var(--color-bg-surface)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`${
                          expandedMenu === item.label
                            ? "text-[var(--color-primary)]"
                            : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                    <motion.svg
                      animate={{ rotate: expandedMenu === item.label ? 90 : 0 }}
                      className="w-4 h-4 text-[var(--color-text-muted)]"
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
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {expandedMenu === item.label && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 space-y-1 pb-2">
                          {item.children.map((child) => {
                            const active = isActive(child.href);
                            return (
                              <Link
                                key={child.label}
                                to={child.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                                  active
                                    ? "text-white bg-[var(--color-primary)]"
                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
                                }`}
                              >
                                <span
                                  className={
                                    active
                                      ? "text-white"
                                      : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]"
                                  }
                                >
                                  {child.icon}
                                </span>
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 mb-1 ${
                    isActive(item.href)
                      ? "bg-[var(--color-primary)] text-white shadow-md shadow-blue-500/20"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <span
                    className={
                      isActive(item.href)
                        ? "text-white"
                        : "text-[var(--color-text-muted)]"
                    }
                  >
                    {item.icon}
                  </span>
                  <span className={isActive(item.href) ? "text-white" : ""}>
                    {item.label}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-[var(--color-border)]">
              {user?.name?.[0].toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-[var(--color-text-primary)]">
                {user?.name || "Admin User"}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">
                {user?.email || "admin@duralux.com"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
              title="Logout"
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
                  strokeWidth={1.5}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-[var(--color-bg-primary)] relative">
        {/* Top Header - Duralux Style */}
        <header className="h-20 px-8 flex items-center justify-between z-30 sticky top-0 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-[var(--color-text-secondary)]">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              {navItems.find(
                (i) =>
                  (i.href && isActive(i.href)) ||
                  (i.children && i.children.some((c) => isActive(c.href))),
              )?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View Store Button */}
            <Link to="/" target="_blank" className="hidden md:block mr-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
              >
                <span>Store</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Button>
            </Link>

            <div className="h-8 w-px bg-[var(--color-border)] mx-1" />

            {/* Maximize Toggle */}
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen();
                } else {
                  if (document.exitFullscreen) {
                    document.exitFullscreen();
                  }
                }
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-surface)] transition-all"
              title="Toggle Fullscreen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-surface)] transition-all"
            >
              {theme === "dark" ? (
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
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
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
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Notifications */}
            <NotificationBell />
          </div>
        </header>

        {/* Content Body - No global padding here */}
        <main
          id="admin-main-content"
          className="flex-1 overflow-y-auto relative scroll-smooth"
        >
          <div className="min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
