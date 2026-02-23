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

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
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
