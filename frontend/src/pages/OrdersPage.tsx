import { useState } from "react";
import { Link } from "react-router-dom";
import { useOrders, type Order } from "../hooks/useOrders";
import Button from "../components/ui/Button";
import OrderDetailsModal from "../components/orders/OrderDetailsModal";
import InvoiceModal from "../components/orders/InvoiceModal";

const OrdersPage = () => {
  const { data: orders, isLoading, error } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleViewInvoice = (order: Order) => {
    setSelectedOrder(order);
    setInvoiceOpen(true);
  };

  const filteredOrders = orders?.filter((order) =>
    filterStatus === "All" ? true : order.status === filterStatus.toLowerCase()
  );

  const tabs = [
    "All",
    "Pending",
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
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filterStatus === tab
                ? "bg-[var(--color-primary)] text-white shadow-lg shadow-blue-500/20"
                : "bg-white text-[var(--color-text-muted)] hover:bg-gray-50 border border-transparent hover:border-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {!orders || orders.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center bg-white rounded-3xl border border-[var(--color-border)] p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-xs uppercase text-[var(--color-text-muted)] font-semibold tracking-wider">
                  <th className="px-6 py-5">Tracking ID</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Delivery</th>
                  <th className="px-6 py-5">Total</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredOrders?.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[var(--color-bg-elevated)] transition-colors group"
                  >
                    <td className="px-6 py-5 font-medium text-[var(--color-primary)]">
                      #{order.tracking_id || order.id}
                    </td>
                    <td className="px-6 py-5 text-[var(--color-text-secondary)]">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-5">
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
                    </td>
                    <td className="px-6 py-5 text-[var(--color-text-secondary)]">
                      {
                        /* Calculate delivery fee: Total - (Items * Price) - Tax(10%) roughly, or just display "Free" if >50? 
                           For now, let's display "Free" if total matches item sum, else show diff.
                           Simpler: Check if it was pickup or delivery. Since we don't store "method" easily accessible here without calculation,
                           let's just show "Free" for now as per design ref or $9.99 */
                        Number(order.total) > 50 ? (
                          <span className="text-green-600 font-medium">
                            Free
                          </span>
                        ) : (
                          <span>$9.99</span>
                        )
                      }
                    </td>
                    <td className="px-6 py-5 font-bold text-[var(--color-text-primary)]">
                      ${Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoice(order)}
                          className="hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 text-gray-600"
                        >
                          Invoice
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                        >
                          Details
                        </Button>
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
