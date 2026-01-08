import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { useAuthStore } from "./stores/authStore";

// Layout Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import CartDrawer from "./components/cart/CartDrawer";

// Pages - Eager load critical pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Admin Pages - Lazy load for code splitting
const AdminDashboard = lazy(() => import("./pages/admin/DashboardPage"));
const AdminProducts = lazy(() => import("./pages/admin/ProductsPage"));
const AdminOrders = lazy(() => import("./pages/admin/OrdersPage"));

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
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Customer Routes */}
            <Route element={<ProtectedRoute />}>
              {/* Add customer-only routes here (orders, profile, etc.) */}
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
              path="/admin/orders"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminOrders />
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
