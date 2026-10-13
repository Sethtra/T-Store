import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { useCartStore } from "../../stores/cartStore";
import { useAuthStore } from "../../stores/authStore";
import { useOrders } from "../../hooks/useOrders";
import { useCategories } from "../../hooks/useProducts";
import NotificationList from "../notifications/NotificationList";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isKh = i18n.language === "kh";
  const { totalItems, toggleCart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const { data: orders } = useOrders();
  const { data: categories } = useCategories();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [query, setQuery] = useState("");
  const [now] = useState(() => Date.now());

  // Close the menu whenever the route changes (adjust state during render, no effect needed)
  const routeKey = location.pathname + location.search;
  const [menuRoute, setMenuRoute] = useState(routeKey);
  if (menuRoute !== routeKey) {
    setMenuRoute(routeKey);
    setIsMenuOpen(false);
  }

  const unpaidCount = isAuthenticated
    ? (orders || []).filter((o) => o.payment_status !== "paid").length
    : 0;

  const recentCount = isAuthenticated
    ? (orders || []).filter(
        (o) => now - new Date(o.updated_at).getTime() < 7 * 24 * 60 * 60 * 1000,
      ).length
    : 0;

  const isHidden =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname === "/checkout" ||
    /^\/products\/[^/]+$/.test(location.pathname);

  if (isHidden) return null;

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  const cartCount = totalItems();

  const tabs = [
    {
      key: "home",
      label: t("nav.home"),
      icon: Home,
      active: location.pathname === "/" && !isMenuOpen,
      onClick: () => navigate("/"),
    },
    {
      key: "shop",
      label: t("nav.featured"),
      icon: Store,
      active: location.pathname === "/products" && !isMenuOpen,
      onClick: () => navigate("/products"),
    },
    {
      key: "cart",
      label: isKh ? "កន្ត្រក" : "Cart",
      icon: ShoppingBag,
      badge: cartCount,
      active: false,
      onClick: () => toggleCart(),
    },
    {
      key: "orders",
      label: t("nav.orders"),
      icon: Package,
      badge: unpaidCount,
      active: location.pathname === "/orders" && !isMenuOpen,
      onClick: () => navigate(isAuthenticated ? "/orders" : "/login"),
    },
    {
      key: "menu",
      label: isKh ? "ម៉ឺនុយ" : "Menu",
      icon: isMenuOpen ? X : Menu,
      active: isMenuOpen,
      onClick: () => setIsMenuOpen((v) => !v),
    },
  ];

  const rowClass =
    "flex items-center gap-3 w-full min-h-12 px-3 rounded-[var(--radius-md)] text-[0.9375rem] font-medium text-[var(--color-text-primary)] active:bg-[var(--color-bg-surface)]";

  return (
    <>
      <nav
        aria-label="Mobile"
        className="md:hidden fixed bottom-0 inset-x-0 z-[55] bg-[var(--color-bg-primary)] border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 h-[60px]">
          {tabs.map(({ key, label, icon: Icon, badge, active, onClick }) => (
            <button
              key={key}
              type="button"
              onClick={onClick}
              aria-current={active ? "page" : undefined}
              aria-expanded={key === "menu" ? isMenuOpen : undefined}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                active ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"
              }`}
            >
              <span className="relative">
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.2 : 1.8} />
                {badge ? (
                  <span className="tabular absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[10px] font-bold leading-[17px] text-center ring-2 ring-[var(--color-bg-primary)]">
                    {badge > 99 ? "99+" : badge}
                  </span>
                ) : null}
              </span>
              <span className={`text-[11px] leading-none ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden fixed inset-x-0 top-16 bottom-[calc(60px+env(safe-area-inset-bottom))] z-[60] bg-[var(--color-bg-primary)] overflow-y-auto overscroll-contain"
          >
            <div className="px-4 pt-4 pb-8 space-y-6">
              <form
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = query.trim();
                  navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
                }}
              >
                <label className="relative block">
                  <span className="sr-only">{t("nav.search")}</span>
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--color-text-muted)]" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("nav.search")}
                    className="w-full h-12 pl-11 pr-3 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-text-primary)]"
                  />
                </label>
              </form>

              {isAuthenticated && (
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-11 h-11 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{user?.name}</p>
                    <p className="text-sm text-[var(--color-text-muted)] truncate">{user?.email}</p>
                  </div>
                </div>
              )}

              <section>
                <h2 className="px-3 mb-1 text-sm font-semibold text-[var(--color-text-muted)]">
                  {t("nav.categories")}
                </h2>
                <ul>
                  {categories?.map((cat) => (
                    <li key={cat.id} className="border-b border-[var(--color-border)] last:border-0">
                      <button
                        type="button"
                        onClick={() => setExpanded((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
                        aria-expanded={!!expanded[cat.id]}
                        className={`${rowClass} justify-between`}
                      >
                        {isKh && cat.name_kh ? cat.name_kh : cat.name}
                        <ChevronDown
                          className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 ${expanded[cat.id] ? "rotate-180" : ""}`}
                        />
                      </button>
                      {expanded[cat.id] && (
                        <ul className="pb-2 pl-3">
                          <li>
                            <Link
                              to={`/products?category=${cat.slug}`}
                              className="flex items-center min-h-11 px-3 text-sm font-semibold"
                            >
                              {isKh ? "មើលទាំងអស់" : `All ${cat.name}`}
                            </Link>
                          </li>
                          {cat.children?.map((child) => (
                            <li key={child.id}>
                              <Link
                                to={`/products?category=${child.slug}`}
                                className="flex items-center min-h-11 px-3 text-sm text-[var(--color-text-secondary)]"
                              >
                                {isKh && child.name_kh ? child.name_kh : child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-0.5">
                <Link to="/about" className={rowClass}>
                  {t("nav.about")}
                </Link>
                {isAuthenticated && (
                  <button type="button" onClick={() => setShowNotifications(true)} className={`${rowClass} justify-between`}>
                    <span className="flex items-center gap-3">
                      <Bell className="w-[18px] h-[18px]" />
                      {isKh ? "ការជូនដំណឹង" : "Notifications"}
                    </span>
                    {recentCount > 0 && (
                      <span className="tabular text-sm text-[var(--color-text-muted)]">{recentCount}</span>
                    )}
                  </button>
                )}
                {isAuthenticated && user?.role === "admin" && (
                  <Link to="/admin" className={rowClass}>
                    <LayoutDashboard className="w-[18px] h-[18px]" />
                    {isKh ? "ផ្ទាំងគ្រប់គ្រង" : "Admin dashboard"}
                  </Link>
                )}
                {isAuthenticated && (
                  <button type="button" onClick={handleLogout} className={`${rowClass} text-[var(--color-error)]`}>
                    <LogOut className="w-[18px] h-[18px]" />
                    {t("nav.logout")}
                  </button>
                )}
              </section>

              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className="h-12 inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-hover)] font-semibold"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/register"
                    className="h-12 inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-semibold"
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={isKh ? "ការជូនដំណឹង" : "Notifications"}
            className="md:hidden fixed inset-0 z-[80] bg-[var(--color-bg-primary)] overflow-y-auto"
          >
            <div className="sticky top-0 z-10 flex items-center gap-2 h-14 px-2 pt-[env(safe-area-inset-top)] border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]">
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                aria-label="Back"
                className="grid place-items-center w-10 h-10 rounded-[var(--radius-md)] text-[var(--color-text-secondary)]"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-base font-semibold">{isKh ? "ការជូនដំណឹង" : "Notifications"}</h2>
            </div>
            <NotificationList
              orders={orders || []}
              onItemClick={() => setShowNotifications(false)}
              maxHeight="none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileBottomNav;
