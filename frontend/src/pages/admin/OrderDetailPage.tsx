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
      >
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/orders"
              className="p-2 rounded-lg hover:bg-[var(--color-bg-elevated)] transition-colors"
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
                <h1 className="text-2xl font-bold font-mono">
                  {order.tracking_id}
                </h1>
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {order.status}
                </Badge>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                Order placed on{" "}
                {new Date(order.created_at).toLocaleDateString()} at{" "}
                {new Date(order.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--color-success)]">
              ${Number(order.total).toFixed(2)}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Total Amount
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer & Shipping */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer Info */}
            <Card>
              <Card.Header>
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <h2 className="font-semibold">Buyer Information</h2>
                </div>
              </Card.Header>
              <Card.Body className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Name</p>
                  <p className="font-medium">{order.shipping_name}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Email
                  </p>
                  <p className="font-medium">{order.shipping_email}</p>
                </div>
                {order.shipping_phone && (
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Phone
                    </p>
                    <p className="font-medium">{order.shipping_phone}</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Shipping Address */}
            <Card>
              <Card.Header>
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <h2 className="font-semibold">Shipping Address</h2>
                </div>
              </Card.Header>
              <Card.Body>
                {isSelfPickup ? (
                  <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-elevated)] rounded-lg">
                    <svg
                      className="w-8 h-8 text-[var(--color-primary)]"
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
                    <div>
                      <p className="font-medium">Self Pick Up</p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        Customer will pick up the order
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                        Street Address
                      </span>
                      <p className="text-[var(--color-text-primary)] mt-1">
                        {order.shipping_address}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                          City
                        </span>
                        <p className="text-[var(--color-text-primary)] mt-1">
                          {order.shipping_city || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                          Postal Code
                        </span>
                        <p className="text-[var(--color-text-primary)] mt-1">
                          {order.shipping_postal_code || "-"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                        Country
                      </span>
                      <p className="text-[var(--color-text-primary)] mt-1">
                        {order.shipping_country || "-"}
                      </p>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Payment & Notes */}
            <Card>
              <Card.Header>
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
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <h2 className="font-semibold">Payment</h2>
                </div>
              </Card.Header>
              <Card.Body className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Method
                  </p>
                  <p className="font-medium capitalize">
                    {order.payment_method || "Not specified"}
                  </p>
                </div>
                {order.notes && (
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Notes
                    </p>
                    <p className="text-sm bg-[var(--color-bg-elevated)] p-3 rounded-lg">
                      {order.notes}
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>

          {/* Right Column - Order Items */}
          <div className="lg:col-span-2">
            <Card>
              <Card.Header>
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
                  <h2 className="font-semibold">
                    Order Items ({order.items.length})
                  </h2>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="divide-y divide-[var(--color-border)]">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 hover:bg-[var(--color-bg-elevated)] transition-colors"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-[var(--color-bg-surface)] rounded-lg overflow-hidden flex-shrink-0">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-[var(--color-text-muted)]"
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
                        <p className="font-medium truncate">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          ${Number(item.price).toFixed(2)} × {item.quantity}
                        </p>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="font-semibold">
                          ${item.subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total</span>
                    <span className="text-xl font-bold text-[var(--color-success)]">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
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
