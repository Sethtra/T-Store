import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";
import { useThemeStore } from "../../stores/themeStore";
import { useAppBootstrap } from "../../hooks/useAppBootstrap";
import { useOrders } from "../../hooks/useOrders";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";
import CustomerNotificationBell from "../notifications/CustomerNotificationBell";
import SiteLogo from "../ui/SiteLogo";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalItems, toggleCart } = useCartStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isKh = i18n.language === "kh";

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "kh" : "en";
    i18n.changeLanguage(newLang);
  };

  const { data: bootstrapData } = useAppBootstrap();
  const categories = bootstrapData?.categories;

  // Fetch orders for desktop badge counts
  const { data: orders } = useOrders();
  const unpaidCount = isAuthenticated
    ? (orders || []).filter((o) => o.payment_status !== "paid").length
    : 0;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-[padding,background-color] duration-500 ease-in-out ${
        scrolled ? "glass shadow-sm py-1.5 md:py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <nav className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <SiteLogo size="md" showName={true} nameClassName="bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)] bg-clip-text text-transparent group-hover:to-[var(--color-primary)] transition-all duration-300" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-[var(--color-bg-elevated)]/50 backdrop-blur-sm rounded-full border border-[var(--color-border)]/50">
            {/* Home Link */}
            <Link
              to="/"
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                location.pathname === "/"
                  ? "text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
              }`}
            >
              {location.pathname === "/" && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-[var(--color-primary)] rounded-full shadow-md z-0"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
              <span
                className="relative z-20"
                style={{
                  color: location.pathname === "/" ? "#ffffff" : undefined,
                  textShadow:
                    location.pathname === "/"
                      ? "0 1px 2px rgba(0,0,0,0.1)"
                      : undefined,
                }}
              >
                {t("nav.home")}
              </span>
            </Link>

            {/* Categories Mega Menu */}
            <div className="relative group px-5 py-2 cursor-pointer">
              <div className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors relative z-20">
                {t("nav.categories")}
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Dropdown Panel */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[800px] p-6 bg-[var(--color-bg-elevated)] rounded-2xl shadow-xl border border-[var(--color-border)]/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-topvh scale-95 group-hover:scale-100 z-50 overflow-hidden">
                <div className="grid grid-cols-4 gap-8">
                  {categories?.map((cat) => (
                    <div key={cat.id} className="space-y-3">
                      <Link
                        to={`/products?category=${cat?.slug}`}
                        className="block font-bold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors text-lg"
                      >
                        {isKh && cat.name_kh ? cat.name_kh : cat.name}
                      </Link>
                      {cat.children && cat.children.length > 0 && (
                        <ul className="space-y-2">
                          {cat.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                to={`/products?category=${child?.slug}`}
                                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors block"
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
            </div>

            {/* Products Link */}
            <Link
              to="/products"
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                location.pathname === "/products"
                  ? "text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
              }`}
            >
              {location.pathname === "/products" && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-[var(--color-primary)] rounded-full shadow-md z-0"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
              <span
                className="relative z-20"
                style={{
                  color:
                    location.pathname === "/products" ? "#ffffff" : undefined,
                  textShadow:
                    location.pathname === "/products"
                      ? "0 1px 2px rgba(0,0,0,0.1)"
                      : undefined,
                }}
              >
                {t("nav.featured")}
              </span>
            </Link>

            {/* About Link */}
            <Link
              to="/about"
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                location.pathname === "/about"
                  ? "text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
              }`}
            >
              {location.pathname === "/about" && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-[var(--color-primary)] rounded-full shadow-md z-0"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
              <span
                className="relative z-20"
                style={{
                  color: location.pathname === "/about" ? "#ffffff" : undefined,
                  textShadow:
                    location.pathname === "/about"
                      ? "0 1px 2px rgba(0,0,0,0.1)"
                      : undefined,
                }}
              >
                {t("nav.about")}
              </span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span className={i18n.language === "en" ? "text-[var(--color-primary)]" : "opacity-40"}>EN</span>
              <div className="w-[1px] h-3 bg-[var(--color-border)]" />
              <span className={i18n.language === "kh" ? "text-[var(--color-primary)]" : "opacity-40"}>KH</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex p-2.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-all active:scale-95"
              aria-label="Toggle Theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "dark" ? (
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
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  ) : (
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
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Mobile Profile (Only shows on mobile when authenticated) */}
            {isAuthenticated && (
              <div className="flex md:hidden items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-[var(--color-primary)] to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg shadow-[var(--color-primary)]/20 border border-[var(--color-bg-primary)] shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
            )}

            {/* Customer Notifications (Only shows if authenticated) - Hidden on mobile */}
            <div className="hidden md:block">
              <CustomerNotificationBell />
            </div>

            {/* Orders Shortcut (Only shows if authenticated) - Hidden on mobile */}
            {isAuthenticated && (
              <button
                onClick={() => navigate("/orders")}
                className="hidden md:flex relative p-2.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-all active:scale-95"
                aria-label={t("nav.orders")}
                title={t("nav.orders")}
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                {unpaidCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 bg-[var(--color-error)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[var(--color-bg-primary)]"
                  >
                    {unpaidCount > 9 ? "9+" : unpaidCount}
                  </motion.span>
                )}
              </button>
            )}

            {/* Cart Button - Hidden on mobile */}
            <button
              onClick={toggleCart}
              className="hidden md:flex relative p-2.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-all active:scale-95"
              aria-label="Shopping Cart"
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
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {totalItems() > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 bg-[var(--color-error)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[var(--color-bg-primary)]"
                >
                  {totalItems()}
                </motion.span>
              )}
            </button>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-[var(--color-border)]/50">
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-[var(--color-bg-surface)] transition-colors text-left">
                    <div className="w-9 h-9 bg-gradient-to-br from-[var(--color-primary)] to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--color-primary)]/20">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium leading-none">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {user?.email}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 text-[var(--color-text-muted)] hidden lg:block"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--color-bg-elevated)] rounded-2xl shadow-xl border border-[var(--color-border)]/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 z-50 overflow-hidden">
                    <div className="p-2 space-y-1">
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-colors text-[var(--color-primary)]"
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
                              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                          </svg>
                          {isKh ? "ផ្ទាំងគ្រប់គ្រង Admin" : "Admin Dashboard"}
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors"
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
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        {t("nav.orders")}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
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
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        {t("nav.logout")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      {t("nav.login")}
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      size="sm"
                      className="shadow-lg shadow-[var(--color-primary)]/20"
                    >
                      {t("nav.register")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

