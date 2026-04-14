import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import api from "./lib/api";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import CartDrawer from "./components/cart/CartDrawer";
import ScrollToTop from "./components/layout/ScrollToTop";

// Pages - Eager load critical pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import AboutPage from "./pages/AboutPage";

// Admin Pages - Lazy load for code splitting
const AdminDashboard = lazy(() => import("./pages/admin/DashboardPage"));
const AdminProducts = lazy(() => import("./pages/admin/ProductsPage"));
const AdminCategories = lazy(() => import("./pages/admin/CategoriesPage"));
const AdminOrders = lazy(() => import("./pages/admin/OrdersPage"));
const AdminOrderDetail = lazy(() => import("./pages/admin/OrderDetailPage"));
const AdminLanding = lazy(() => import("./pages/admin/LandingSectionPage"));
const AdminCategoryDisplay = lazy(
  () => import("./pages/admin/CategoryDisplayPage"),
);
const AdminNotifications = lazy(
  () => import("./pages/admin/NotificationsPage"),
);
const AdminUsers = lazy(() => import("./pages/admin/UsersPage"));
const AdminInventory = lazy(() => import("./pages/admin/InventoryPage"));
const AdminReports = lazy(() => import("./pages/admin/ReportsPage"));

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Layout wrapper
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
};

// Protected Route Component
const ProtectedRoute = ({
  requireAdmin = false,
}: {
  requireAdmin?: boolean;
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Universal Premium Page Skeleton
const PageLoader = () => (
  <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="space-y-3">
        <div className="h-8 w-48 bg-[var(--color-bg-surface)] rounded-xl" />
        <div className="h-4 w-32 bg-[var(--color-bg-surface)] rounded-lg opacity-60" />
      </div>
      <div className="h-10 w-32 bg-[var(--color-bg-surface)] rounded-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-40 bg-[var(--color-bg-surface)] rounded-2xl" />
      <div className="h-40 bg-[var(--color-bg-surface)] rounded-2xl" />
      <div className="h-40 bg-[var(--color-bg-surface)] rounded-2xl" />
    </div>
    <div className="h-96 bg-[var(--color-bg-surface)] rounded-3xl" />
  </div>
);

function App() {
  // Track visitor once on mount
  useEffect(() => {
    // Fire and forget - count this visit
    api.post("/visit").catch(() => {
      // Ignore errors (e.g., ad blockers, network issues)
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Customer Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route
              path="/admin"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboard />
                </Suspense>
              }
            />
            <Route
              path="/admin/products"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminProducts />
                </Suspense>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminCategories />
                </Suspense>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminInventory />
                </Suspense>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminReports />
                </Suspense>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminOrders />
                </Suspense>
              }
            />
            <Route
              path="/admin/orders/:id"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminOrderDetail />
                </Suspense>
              }
            />
            <Route
              path="/admin/landing"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminLanding />
                </Suspense>
              }
            />
            <Route
              path="/admin/category-display"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminCategoryDisplay />
                </Suspense>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminNotifications />
                </Suspense>
              }
            />
            <Route
              path="/admin/users"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminUsers />
                </Suspense>
              }
            />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-[var(--color-primary)]">
                    404
                  </h1>
                  <p className="text-xl text-[var(--color-text-muted)] mt-4">
                    Page not found
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
