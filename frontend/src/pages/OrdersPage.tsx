import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOrders, type Order } from "../hooks/useOrders";
import Button from "../components/ui/Button";
import OrderDetailsModal from "../components/orders/OrderDetailsModal";
import InvoiceModal from "../components/orders/InvoiceModal";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { data: orders, isLoading, error } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [, setTick] = useState(0);

  // Re-render every minute to update countdowns
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate remaining time for 24hr payment window
  const getCountdown = (createdAt: string) => {
    const deadline = new Date(createdAt).getTime() + 24 * 60 * 60 * 1000;
    const now = Date.now();
    const remaining = deadline - now;
    if (remaining <= 0) return null;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleViewInvoice = (order: Order) => {
    setSelectedOrder(order);
    setInvoiceOpen(true);
  };

  const filteredOrders = orders?.filter((order) => {
    if (filterStatus === "All") return true;
    
    if (filterStatus === "Payment Pending") {
      return order.payment_status === "pending" || order.payment_status === "failed";
    }
    
    // For all other tabs, don't show unpaid orders (they belong in Payment Pending)
    if (order.payment_status === "pending" || order.payment_status === "failed") {
      return false;
    }

    if (filterStatus === "Processing") {
      return order.status === "pending" || order.status === "processing";
    }
    if (filterStatus === "Shipped") return order.status === "shipped";
    if (filterStatus === "Completed") return order.status === "completed";
    if (filterStatus === "Cancelled") return order.status === "cancelled";
    
    return order.status === filterStatus.toLowerCase();
  });

  const tabs = [
    "All",
    "Payment Pending",
    "Processing",
    "Shipped",
    "Completed",
    "Cancelled",
  ];

  if (isLoading) {
    return (
      <div className="container pb-16" style={{ paddingTop: "140px" }}>
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 rounded-lg animate-pulse"
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
        style={{ paddingTop: "140px" }}
      >
        <h1 className="text-3xl font-bold mb-4">My Orders</h1>
        <p className="text-[var(--color-error)]">Failed to load orders</p>
      </div>
    );
  }

  return (
    <div className="container pb-16" style={{ paddingTop: "140px" }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              filterStatus === tab
                ? "bg-[var(--color-primary)] text-white shadow-lg shadow-blue-500/20"
                : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-text-muted)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {!orders || orders.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center bg-[var(--color-bg-elevated)] rounded-3xl border border-[var(--color-border)] px-4 py-12 text-center overflow-hidden">
          <div className="w-20 h-20 bg-[var(--color-bg-surface)] rounded-full flex items-center justify-center mb-6 border border-[var(--color-border)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-[var(--color-text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">No orders found</h2>
          <p className="text-[var(--color-text-muted)] mb-8">
            You haven't placed any orders yet.
          </p>
          <Link to="/products">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-[var(--color-bg-primary)] rounded-3xl border border-[var(--color-border)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-[10px] sm:text-xs uppercase text-[var(--color-text-muted)] font-semibold tracking-wider">
                  <th className="px-3 sm:px-6 py-4 sm:py-5">Tracking ID</th>
                  <th className="px-3 sm:px-6 py-4 sm:py-5">Date</th>
                  <th className="px-3 sm:px-6 py-4 sm:py-5 hidden md:table-cell">Status</th>
                  <th className="px-3 sm:px-6 py-4 sm:py-5 hidden sm:table-cell">Time Left</th>
                  <th className="px-3 sm:px-6 py-4 sm:py-5 hidden lg:table-cell">Delivery</th>
                  <th className="px-3 sm:px-6 py-4 sm:py-5">Total</th>
                  <th className="px-3 sm:px-6 py-4 sm:py-5 text-right hidden sm:table-cell">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredOrders?.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[var(--color-bg-elevated)] transition-colors group cursor-pointer sm:cursor-default"
                    onClick={() => {
                      // On mobile, clicking the row opens details
                      if (window.innerWidth < 640) {
                        if (order.payment_status === "pending") {
                          navigate(`/checkout?retry_order=${order.id}`);
                        } else {
                          handleViewDetails(order);
                        }
                      }
                    }}
                  >
                    <td className="px-3 sm:px-6 py-4 sm:py-5 font-medium text-[var(--color-primary)] text-xs sm:text-sm">
                      <span className="inline-block max-w-[80px] sm:max-w-none truncate align-bottom">
                        #{order.tracking_id || order.id}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 sm:py-5 text-[var(--color-text-secondary)] whitespace-nowrap text-xs sm:text-sm">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 sm:px-6 py-4 sm:py-5 hidden md:table-cell">
                      {order.payment_status === "pending" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          Payment Pending
                        </span>
                      ) : order.payment_status === "failed" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          ✕ Payment Failed
                        </span>
                      ) : order.payment_status === "cancelled" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Cancelled
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                        >
                          {order.status}
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-4 sm:py-5 hidden sm:table-cell">
                      {order.payment_status === "pending" ? (
                        getCountdown(order.created_at) ? (
                          <span className="text-sm font-semibold text-[var(--color-error)]">
                            {getCountdown(order.created_at)}
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-[var(--color-error)]">
                            Expired
                          </span>
                        )
                      ) : (
                        <span className="text-sm text-[var(--color-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-4 sm:py-5 text-[var(--color-text-secondary)] hidden lg:table-cell">
                      {
                        Number(order.total) > 50 ? (
                          <span className="text-green-600 font-medium">
                            Free
                          </span>
                        ) : (
                          <span>$9.99</span>
                        )
                      }
                    </td>
                    <td className="px-3 sm:px-6 py-4 sm:py-5 font-bold text-[var(--color-text-primary)] text-xs sm:text-sm">
                      ${Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 sm:py-5 hidden sm:table-cell">
                      <div className="flex items-center justify-end gap-2">
                        {order.payment_status === "pending" ? (
                          <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); navigate(`/checkout?retry_order=${order.id}`); }}
                            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white border-none shadow-lg shadow-[var(--color-primary)]/20"
                          >
                            Pay Now
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleViewInvoice(order); }}
                              className="border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] hover:border-[var(--color-text-muted)]"
                            >
                              Invoice
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleViewDetails(order); }}
                            >
                              Details
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders?.length === 0 && (
            <div className="p-12 text-center text-[var(--color-text-muted)]">
              No orders found in this category.
            </div>
          )}
        </div>
      )}

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
