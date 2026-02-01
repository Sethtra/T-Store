import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api from "../../lib/api";
import AdminLayout from "../../components/admin/AdminLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

interface OrderDetail {
  id: number;
  tracking_id: string;
  status: string;
  total: string;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  shipping_postal_code: string | null;
  notes: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
  items: Array<{
    id: number;
    product_id: number;
    product_name: string;
    product_image: string | null;
    quantity: number;
    price: string;
    subtotal: number;
    attributes?: Record<string, string> | null;
  }>;
}

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery<OrderDetail>({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const res = await api.get(`/admin/orders/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      case "pending":
        return "warning";
      case "processing":
      case "shipped":
        return "primary";
      default:
        return "default";
    }
  };

  // Check if shipping address is "Self Pick Up" or missing
  const isSelfPickup =
    !order?.shipping_address ||
    order.shipping_address.toLowerCase() === "self pick up" ||
    order.shipping_address.toLowerCase() === "pickup";

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-[var(--color-error)] mb-4">Failed to load order</p>
          <Link
            to="/admin/orders"
            className="text-[var(--color-primary)] hover:underline"
          >
            Back to Orders
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 lg:p-8 max-w-7xl mx-auto"
      >
        {/* Header with back button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/orders"
              className="p-2 rounded-lg hover:bg-[var(--color-bg-elevated)] transition-colors border border-transparent hover:border-[var(--color-border)]"
            >
              <svg
                className="w-5 h-5 text-[var(--color-text-muted)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold font-mono tracking-tight text-[var(--color-text-primary)]">
                  {order.tracking_id}
                </h1>
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {order.status}
                </Badge>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString()} at{" "}
                {new Date(order.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Actions placeholder - could be print/export buttons */}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column (Main Content) - Order Items & Totals */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border border-[var(--color-border)] shadow-sm">
              <Card.Header className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] px-6 py-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[var(--color-primary)]"
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
                  <h2 className="font-semibold text-[var(--color-text-primary)]">
                    Order Items{" "}
                    <span className="text-[var(--color-text-muted)] font-normal">
                      ({order.items.length})
                    </span>
                  </h2>
                </div>
              </Card.Header>

              <Card.Body className="p-0">
                <div className="divide-y divide-[var(--color-border)]">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 sm:p-6 hover:bg-[var(--color-bg-elevated)]/50 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[var(--color-bg-elevated)] rounded-xl overflow-hidden flex-shrink-0 border border-[var(--color-border)]">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-[var(--color-text-muted)]/50"
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
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/admin/products/${item.product_id}`}
                          className="font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors truncate block"
                        >
                          {item.product_name}
                        </Link>
                        <p className="text-sm text-[var(--color-text-muted)] mt-1">
                          Product ID: #{item.product_id}
                        </p>
                        {item.attributes &&
                          Object.keys(item.attributes).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Object.entries(item.attributes).map(
                                ([key, value]) => (
                                  <span
                                    key={key}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                                  >
                                    <span className="opacity-70 mr-1 capitalize">
                                      {key}:
                                    </span>{" "}
                                    {value}
                                  </span>
                                ),
                              )}
                            </div>
                          )}
                      </div>

                      {/* Pricing */}
                      <div className="text-right">
                        <p className="font-medium text-[var(--color-text-primary)]">
                          ${Number(item.subtotal).toFixed(2)}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                          {item.quantity} × ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Section */}
                <div className="bg-[var(--color-bg-elevated)]/30 border-t border-[var(--color-border)] p-6 space-y-3">
                  <div className="flex justify-between items-center text-sm text-[var(--color-text-secondary)]">
                    <span>Subtotal</span>
                    <span>${Number(order.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-[var(--color-text-secondary)]">
                    <span>Shipping</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-[var(--color-text-secondary)]">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="pt-3 border-t border-[var(--color-border)] flex justify-between items-center">
                    <span className="text-base font-semibold text-[var(--color-text-primary)]">
                      Total Amount
                    </span>
                    <span className="text-xl font-bold text-[var(--color-success)]">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Right Column (Sidebar) - Consolidated Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border border-[var(--color-border)] shadow-sm">
              <Card.Header className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] px-6 py-4">
                <h2 className="font-semibold text-[var(--color-text-primary)]">
                  Order Information
                </h2>
              </Card.Header>
              <Card.Body className="p-0">
                {/* Customer Section */}
                <div className="p-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Customer Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {order.shipping_name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {order.shipping_name}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {order.shipping_email}
                        </p>
                        {order.shipping_phone && (
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {order.shipping_phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[var(--color-border)] mx-6" />

                {/* Shipping Section */}
                <div className="p-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Shipping Address
                  </h3>
                  {isSelfPickup ? (
                    <div className="bg-[var(--color-bg-elevated)] rounded-lg p-3 flex items-center gap-3">
                      <div className="p-2 bg-[var(--color-bg-surface)] rounded-md text-[var(--color-primary)]">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          Self Pick Up
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          Store Location
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-[var(--color-text-secondary)] space-y-1">
                      <p className="font-medium text-[var(--color-text-primary)]">
                        {order.shipping_address}
                      </p>
                      <p>
                        {order.shipping_city}, {order.shipping_postal_code}
                      </p>
                      <p>{order.shipping_country}</p>
                    </div>
                  )}
                </div>

                <div className="h-px bg-[var(--color-border)] mx-6" />

                {/* Payment Section */}
                <div className="p-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
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
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    Payment Details
                  </h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      Method
                    </span>
                    <Badge variant="default" className="capitalize">
                      {order.payment_method || "N/A"}
                    </Badge>
                  </div>

                  {order.notes && (
                    <div className="mt-4">
                      <span className="text-xs text-[var(--color-text-muted)] block mb-1">
                        Order Notes
                      </span>
                      <div className="bg-[var(--color-bg-elevated)] p-3 rounded-md text-sm italic text-[var(--color-text-secondary)]">
                        "{order.notes}"
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default OrderDetailPage;
