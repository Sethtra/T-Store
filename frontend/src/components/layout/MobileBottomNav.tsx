import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../../stores/cartStore";
import { useAuthStore } from "../../stores/authStore";

import { useOrders } from "../../hooks/useOrders";
import { useCategories } from "../../hooks/useProducts";
import NotificationList from "../notifications/NotificationList";
import Button from "../ui/Button";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems, toggleCart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const { data: orders } = useOrders();
  const { data: categories } = useCategories();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  const unpaidCount = isAuthenticated
    ? (orders || []).filter((o) => o.payment_status !== "paid").length
    : 0;

  const unreadCount = isAuthenticated
    ? (orders || []).filter((o) => {
        const isRecent =
          new Date().getTime() - new Date(o.updated_at).getTime() <
          7 * 24 * 60 * 60 * 1000;
        return isRecent;
      }).length
    : 0;

  // Don't show on admin pages, auth pages, or individual product detail pages
  const isHidden =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password") ||
    // Hide exactly on /products/slug, but NOT on /products directory page 
    /^\/products\/[^/]+$/.test(location.pathname);

  if (isHidden) return null;

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setIsMenuOpen(false);

  const items = [
    {
      label: "Orders",
      badge: unpaidCount,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      onClick: () => {
        if (!isAuthenticated) navigate("/login");
        else navigate("/orders");
      },
      isActive: location.pathname === "/orders",
    },
    {
      label: "Alerts",
      badge: unreadCount,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      onClick: () => {
        if (!isAuthenticated) navigate("/login");
        else setShowNotifications(true);
      },
      isActive: false,
    },
    {
      label: "Cart",
      badge: totalItems(),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      onClick: () => toggleCart(),
      isActive: false,
    },
    {
      label: "Menu",
      badge: 0,
      icon: isMenuOpen ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      onClick: () => setIsMenuOpen(!isMenuOpen),
      isActive: isMenuOpen,
    },
  ];

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[55] bg-[var(--color-bg-primary)]/95 backdrop-blur-xl border-t border-[var(--color-border)] safe-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all active:scale-90 ${
                item.isActive
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 flex items-center justify-center text-[9px] font-bold text-white bg-[var(--color-error)] rounded-full border-[1.5px] border-[var(--color-bg-primary)]"
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </motion.span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 top-[64px] bottom-[56px] z-[60] bg-[var(--color-bg-primary)] overflow-y-auto"
          >
            <div className="px-4 py-6 space-y-6">
              {/* Profile Section */}
              {isAuthenticated && (
                <div className="flex items-center gap-4 p-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-primary)] to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-[var(--color-primary)]/20 border-2 border-[var(--color-bg-primary)]">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] truncate">
                      {user?.name || "User"}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Nav Links */}
              <div className="flex flex-col gap-2">
                <Link to="/" onClick={closeMenu} className={`px-4 py-3 rounded-xl font-medium transition-all ${location.pathname === "/" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"}`}>
                  Home
                </Link>
                <Link to="/products" onClick={closeMenu} className={`px-4 py-3 rounded-xl font-medium transition-all ${location.pathname === "/products" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"}`}>
                  Products
                </Link>
                <Link to="/about" onClick={closeMenu} className={`px-4 py-3 rounded-xl font-medium transition-all ${location.pathname === "/about" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"}`}>
                  About
                </Link>

                <div className="h-px bg-[var(--color-border)]/50 my-2 mx-4" />

                {/* Categories */}
                <div className="px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Categories
                </div>
                <div className="space-y-1">
                  {categories?.map((cat) => (
                    <div key={cat.id} className="px-2">
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-primary)] transition-all"
                      >
                        {cat.name}
                        <svg
                          className={`w-4 h-4 transition-transform duration-300 ${expandedCategories[cat.id] ? "rotate-180 text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <AnimatePresence>
                        {expandedCategories[cat.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden pl-4"
                          >
                            <div className="py-2 space-y-1 border-l-2 border-[var(--color-primary)]/20 ml-4">
                              <Link
                                to={`/products?category=${cat?.slug}`}
                                onClick={closeMenu}
                                className="block px-4 py-2 rounded-xl text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                              >
                                View All {cat.name}
                              </Link>
                              {cat.children?.map((child) => (
                                <Link
                                  key={child.id}
                                  to={`/products?category=${child?.slug}`}
                                  onClick={closeMenu}
                                  className="block px-4 py-2 rounded-xl text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors"
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[var(--color-border)]/50 mx-2" />

              {/* Auth Actions */}
              <div className="flex flex-col gap-3 pb-8">
                {isAuthenticated ? (
                  <>
                    {user?.role === "admin" && (
                      <Link to="/admin" onClick={closeMenu}>
                        <Button variant="ghost" fullWidth className="justify-start gap-3">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors mt-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" onClick={closeMenu}>
                      <Button variant="ghost" fullWidth>Login</Button>
                    </Link>
                    <Link to="/register" onClick={closeMenu}>
                      <Button fullWidth>Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-0 z-[80] bg-[var(--color-bg-primary)] overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              <div className="px-4 py-4 border-b border-[var(--color-border)] flex items-center gap-3 bg-[var(--color-bg-surface)] sticky top-0 z-10">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-2 -ml-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                  Notifications
                </h3>
              </div>
              <div className="flex-1">
                <NotificationList
                  orders={orders || []}
                  onItemClick={() => setShowNotifications(false)}
                  maxHeight="none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileBottomNav;
