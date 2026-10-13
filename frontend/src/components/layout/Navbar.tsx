import { useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  Search,
  ShoppingBag,
  Sun,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";
import { useThemeStore } from "../../stores/themeStore";
import { useAppBootstrap } from "../../hooks/useAppBootstrap";
import { useOrders } from "../../hooks/useOrders";
import CustomerNotificationBell from "../notifications/CustomerNotificationBell";
import SiteLogo from "../ui/SiteLogo";

const iconButton =
  "relative grid place-items-center w-10 h-10 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors";

const CountDot = ({ value, label }: { value: number; label: string }) => (
  <span
    aria-label={label}
    className="tabular absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[10px] font-bold leading-[18px] text-center ring-2 ring-[var(--color-bg-primary)]"
  >
    {value > 9 ? "9+" : value}
  </span>
);

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalItems, toggleCart } = useCartStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isKh = i18n.language === "kh";
  const [query, setQuery] = useState("");

  const { data: bootstrapData } = useAppBootstrap();
  const categories = bootstrapData?.categories;

  const { data: orders } = useOrders();
  const unpaidCount = isAuthenticated
    ? (orders || []).filter((o) => o.payment_status !== "paid").length
    : 0;
  const cartCount = totalItems();

  const toggleLanguage = () => i18n.changeLanguage(isKh ? "en" : "kh");

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-3 py-2 text-[0.9375rem] font-medium transition-colors ${
      isActive
        ? "text-[var(--color-text-primary)] after:absolute after:inset-x-3 after:-bottom-[13px] after:h-[2px] after:bg-[var(--color-text-primary)]"
        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-bg-primary)]/95 supports-[backdrop-filter]:bg-[var(--color-bg-primary)]/85 supports-[backdrop-filter]:backdrop-saturate-150 supports-[backdrop-filter]:backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8">
        <nav className="flex items-center h-16 gap-4 lg:gap-8" aria-label="Main">
          <Link to="/" className="shrink-0 rounded-[var(--radius-sm)]" aria-label="T-Store home">
            <SiteLogo size="sm" showName />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              {t("nav.home")}
            </NavLink>
            <NavLink to="/products" className={linkClass}>
              {t("nav.featured")}
            </NavLink>

            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1 px-3 py-2 text-[0.9375rem] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] group-focus-within:text-[var(--color-text-primary)]"
                aria-haspopup="true"
              >
                {t("nav.categories")}
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
              </button>
              {categories && categories.length > 0 && (
                <div className="absolute left-0 top-full pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 transition-[opacity,transform,visibility] duration-200 z-50">
                  <div className="w-[min(760px,80vw)] p-6 grid grid-cols-3 gap-x-8 gap-y-6 bg-[var(--color-bg-elevated)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-lg)]">
                    {categories.map((cat) => (
                      <div key={cat.id}>
                        <Link
                          to={`/products?category=${cat.slug}`}
                          className="block font-semibold text-[var(--color-text-primary)] hover:underline underline-offset-4"
                        >
                          {isKh && cat.name_kh ? cat.name_kh : cat.name}
                        </Link>
                        {cat.children && cat.children.length > 0 && (
                          <ul className="mt-2 space-y-1.5">
                            {cat.children.map((child) => (
                              <li key={child.id}>
                                <Link
                                  to={`/products?category=${child.slug}`}
                                  className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                >
                                  {isKh && child.name_kh ? child.name_kh : child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/about" className={linkClass}>
              {t("nav.about")}
            </NavLink>
          </div>

          {/* Search (desktop) */}
          <form onSubmit={submitSearch} role="search" className="hidden lg:block flex-1 max-w-sm ml-auto">
            <label className="relative block">
              <span className="sr-only">{t("nav.search")}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("nav.search")}
                className="w-full h-10 pl-9 pr-3 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:bg-[var(--color-bg-primary)] focus:border-[var(--color-text-primary)] transition-colors"
              />
            </label>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto lg:ml-0">
            <button
              type="button"
              onClick={toggleLanguage}
              className="h-10 px-2.5 rounded-[var(--radius-md)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors"
              aria-label={isKh ? "Switch to English" : "ប្តូរទៅភាសាខ្មែរ"}
            >
              <span lang={isKh ? "en" : "km"} className={isKh ? "" : "font-khmer"}>
                {isKh ? "EN" : "ខ្មែរ"}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className={iconButton}
              aria-label={theme === "dark" ? "Use light theme" : "Use dark theme"}
            >
              {theme === "dark" ? <Sun className="w-[19px] h-[19px]" /> : <Moon className="w-[19px] h-[19px]" />}
            </button>

            <div className="hidden md:block">
              <CustomerNotificationBell />
            </div>

            {isAuthenticated && (
              <Link to="/orders" className={`${iconButton} hidden md:grid`} aria-label={t("nav.orders")} title={t("nav.orders")}>
                <Package className="w-[19px] h-[19px]" />
                {unpaidCount > 0 && <CountDot value={unpaidCount} label={`${unpaidCount} unpaid`} />}
              </Link>
            )}

            <button
              type="button"
              onClick={toggleCart}
              className={`${iconButton} hidden md:grid`}
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingBag className="w-[19px] h-[19px]" />
              {cartCount > 0 && <CountDot value={cartCount} label={`${cartCount} items`} />}
            </button>

            {/* Account */}
            <div className="hidden md:flex items-center ml-2 pl-3 border-l border-[var(--color-border)]">
              {isAuthenticated ? (
                <div className="relative group">
                  <button
                    type="button"
                    className="flex items-center gap-2 h-10 pl-1 pr-2 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-surface)] transition-colors"
                    aria-haspopup="true"
                  >
                    <span className="grid place-items-center w-8 h-8 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-primary)]">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                    <span className="hidden xl:block max-w-[9rem] truncate text-sm font-medium">
                      {user?.name || "Account"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                  </button>

                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity duration-150 z-50">
                    <div className="w-60 p-1.5 bg-[var(--color-bg-elevated)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-lg)]">
                      <div className="px-3 py-2.5 border-b border-[var(--color-border)] mb-1">
                        <p className="text-sm font-semibold truncate">{user?.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email}</p>
                      </div>
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-sm font-medium hover:bg-[var(--color-bg-surface)]"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {isKh ? "ផ្ទាំងគ្រប់គ្រង" : "Admin dashboard"}
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-sm font-medium hover:bg-[var(--color-bg-surface)]"
                      >
                        <Package className="w-4 h-4" />
                        {t("nav.orders")}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-bg-surface)]"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("nav.logout")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Link
                    to="/login"
                    className="h-10 px-3 inline-flex items-center rounded-[var(--radius-md)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/register"
                    className="h-10 px-4 inline-flex items-center rounded-[var(--radius-md)] text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)]"
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: avatar initial when signed in */}
            {isAuthenticated && (
              <span className="md:hidden grid place-items-center w-9 h-9 ml-1 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
