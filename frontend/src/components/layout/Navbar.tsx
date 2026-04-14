import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";
import { useThemeStore } from "../../stores/themeStore";
import { useCategories } from "../../hooks/useProducts";
import { useOrders } from "../../hooks/useOrders";
import Button from "../ui/Button";
import CustomerNotificationBell from "../notifications/CustomerNotificationBell";
import NotificationList from "../notifications/NotificationList";


// Helper for icon size consistency
const ActionIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-surface)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all border border-[var(--color-border)] shadow-sm">
    {children}
  </div>
);

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalItems, toggleCart } = useCartStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: categories } = useCategories();

  // Fetch orders to count unpaid ones
  const { data: orders } = useOrders();
  const unpaidCount = isAuthenticated
    ? (orders || []).filter((o) => o.payment_status !== "paid").length
    : 0;

  // Notification count logic (same as bell component)
  const unreadCount = isAuthenticated ? (orders || []).filter((o) => {
    const isRecent = new Date().getTime() - new Date(o.updated_at).getTime() < 7 * 24 * 60 * 60 * 1000;
    return isRecent;
  }).length : 0;

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleCategory = (id: number) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-purple-600 rounded-xl shadow-lg shadow-[var(--color-primary)]/20 transition-all duration-300 group-hover:shadow-[var(--color-primary)]/40 group-hover:scale-105">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)] bg-clip-text text-transparent group-hover:to-[var(--color-primary)] transition-all duration-300">
              T-Store
            </span>
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
                Home
              </span>
            </Link>

            {/* Categories Mega Menu */}
            <div className="relative group px-5 py-2 cursor-pointer">
              <div className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors relative z-20">
                Categories
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
                        {cat.name}
                      </Link>
                      {cat.children && cat.children.length > 0 && (
                        <ul className="space-y-2">
                          {cat.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                to={`/products?category=${child?.slug}`}
                                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors block"
                              >
                                {child.name}
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
                Products
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
                About
              </span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Theme Toggle - Hidden on mobile */}
            <button
              onClick={toggleTheme}
              className="hidden md:flex p-2.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-all active:scale-95"
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

            {/* Customer Notifications (Only shows if authenticated) - Hidden on mobile */}
            <div className="hidden md:block">
              <CustomerNotificationBell />
            </div>

            {/* Orders Shortcut (Only shows if authenticated) - Hidden on mobile */}
            {isAuthenticated && (
              <button
                onClick={() => navigate("/orders")}
                className="hidden md:flex relative p-2.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-all active:scale-95"
                aria-label="My Orders"
                title="My Orders"
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
                          Admin Dashboard
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
                        My Orders
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
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      size="sm"
                      className="shadow-lg shadow-[var(--color-primary)]/20"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-colors"
              aria-label="Toggle Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 top-[64px] z-40 bg-[var(--color-bg-primary)] overflow-y-auto"
          >
            <div className="px-4 py-6 space-y-6">
              {/* Profile Section (Only if Authenticated) */}
              {isAuthenticated && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-[var(--color-primary)]/20 border-2 border-[var(--color-bg-primary)]">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-[var(--color-text-primary)] truncate">
                        {user?.name || "User"}
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)] truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Icon Row */}
                  <div className="grid grid-cols-4 gap-3 px-1">
                    <button onClick={toggleTheme} className="flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <ActionIcon>
                         {theme === "dark" ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                      </ActionIcon>
                      <span className="text-[10px] font-medium text-[var(--color-text-muted)]">Theme</span>
                    </button>

                    <button onClick={() => { setIsMobileMenuOpen(false); navigate("/orders"); }} className="flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-400 relative active:scale-95 transition-transform">
                      <ActionIcon>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </ActionIcon>
                      {unpaidCount > 0 && (
                        <span className="absolute top-0 right-2 bg-[var(--color-error)] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[var(--color-bg-primary)]">
                          {unpaidCount}
                        </span>
                      )}
                      <span className="text-[10px] font-medium text-[var(--color-text-muted)]">Orders</span>
                    </button>

                    <button onClick={() => setShowMobileNotifications(true)} className="flex flex-col items-center gap-1.5 relative animate-in fade-in slide-in-from-bottom-2 duration-500 active:scale-95 transition-transform">
                      <ActionIcon>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </ActionIcon>
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-2 bg-[var(--color-error)] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[var(--color-bg-primary)]">
                          {unreadCount}
                        </span>
                      )}
                      <span className="text-[10px] font-medium text-[var(--color-text-muted)]">Alerts</span>
                    </button>

                    <button onClick={() => { setIsMobileMenuOpen(false); toggleCart(); }} className="flex flex-col items-center gap-1.5 relative animate-in fade-in slide-in-from-bottom-2 duration-600">
                      <ActionIcon>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </ActionIcon>
                      {totalItems() > 0 && (
                        <span className="absolute top-0 right-2 bg-[var(--color-error)] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[var(--color-bg-primary)]">
                          {totalItems()}
                        </span>
                      )}
                      <span className="text-[10px] font-medium text-[var(--color-text-muted)]">Cart</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    location.pathname === "/"
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    location.pathname === "/products"
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  Products
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    location.pathname === "/about"
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  About
                </Link>

                <div className="h-px bg-[var(--color-border)]/50 my-2 mx-4" />

                {/* Mobile Categories - Collapsible */}
                <div className="px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Categories
                </div>
                <div className="space-y-1">
                  {categories?.map((cat) => (
                    <div key={cat.id} className="px-2">
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-primary)] transition-all group"
                      >
                        {cat.name}
                        <svg
                          className={`w-4 h-4 transition-transform duration-300 ${expandedCategories[cat.id] ? "rotate-180 text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
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
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-2 rounded-xl text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                              >
                                View All {cat.name}
                              </Link>
                              {cat.children?.map((child) => (
                                <Link
                                  key={child.id}
                                  to={`/products?category=${child?.slug}`}
                                  onClick={() => setIsMobileMenuOpen(false)}
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

              <div className="flex flex-col gap-3 pb-8">
                {isAuthenticated ? (
                  <>
                    {user?.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          fullWidth
                          className="justify-start gap-3"
                        >
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
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" fullWidth>
                        Login
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button fullWidth>Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Notification Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && showMobileNotifications && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-0 top-[64px] z-50 bg-[var(--color-bg-primary)] overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              <div className="px-4 py-4 border-b border-[var(--color-border)] flex items-center gap-3 bg-[var(--color-bg-surface)]">
                <button 
                  onClick={() => setShowMobileNotifications(false)}
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
                  onItemClick={() => {
                    setShowMobileNotifications(false);
                    setIsMobileMenuOpen(false);
                  }}
                  maxHeight="none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
