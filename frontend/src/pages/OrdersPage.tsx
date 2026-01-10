import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useOrders, type Order } from "../hooks/useOrders";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import OrderDetailsModal from "../components/orders/OrderDetailsModal";
import InvoiceModal from "../components/orders/InvoiceModal";

const OrdersPage = () => {
  const { data: orders, isLoading, error } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleViewInvoice = (order: Order) => {
    setSelectedOrder(order);
    setInvoiceOpen(true);
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "primary";
      case "shipped":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <div className="container pb-16" style={{ paddingTop: "128px" }}>
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="container pb-16 text-center"
        style={{ paddingTop: "128px" }}
      >
        <h1 className="text-3xl font-bold mb-4">My Orders</h1>
        <p className="text-[var(--color-error)]">Failed to load orders</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div
        className="container pb-16 min-h-[60vh] flex flex-col items-center justify-center"
        style={{ paddingTop: "128px" }}
      >
        <div className="w-24 h-24 bg-[var(--color-bg-secondary)] rounded-full flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-[var(--color-primary)]"
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
        </div>
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-[var(--color-text-muted)] mb-8">
          Start shopping to see your orders here.
        </p>
        <Link to="/products">
          <Button
            size="lg"
            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
          >
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container pb-16" style={{ paddingTop: "128px" }}>
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Order Header */}
              <div className="bg-[var(--color-bg-secondary)] px-6 py-4 border-b border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                      Order Placed
                    </p>
                    <p className="font-medium">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="hidden sm:block h-8 w-px bg-[var(--color-border)]"></div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                      Order #
                    </p>
                    <p className="font-medium">{order.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                      Total Amount
                    </p>
                    <p className="text-lg font-bold text-[var(--color-primary)]">
                      ${Number(order.total).toFixed(2)}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(order.status) as any}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[var(--color-bg-secondary)] rounded-lg flex-shrink-0 flex items-center justify-center p-2 overflow-hidden border border-[var(--color-border)]">
                        {item.product?.image_url ||
                        item.product?.images?.[0] ? (
                          <img
                            src={
                              item.product.image_url || item.product.images?.[0]
                            }
                            alt={item.product_title}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-[var(--color-text-muted)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_title}</h4>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          Qty: {item.quantity} × $
                          {Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="font-medium">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm text-[var(--color-text-muted)]">
                      And {order.items.length - 3} more items...
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-[var(--color-border)] flex justify-end">
                  <Button
                    variant="outline"
                    className="mr-3"
                    onClick={() => handleViewInvoice(order)}
                  >
                    Invoice
                  </Button>
                  <Button
                    className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
                    onClick={() => handleViewDetails(order)}
                  >
                    View Order Details
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <OrderDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        order={selectedOrder}
      />

      <InvoiceModal
        isOpen={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default OrdersPage;
