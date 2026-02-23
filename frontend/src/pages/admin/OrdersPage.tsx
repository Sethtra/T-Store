import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAdminOrders, useUpdateOrderStatus } from "../../hooks/useOrders";
import AdminLayout from "../../components/admin/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const OrdersPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);

  // Scroll to top when page changes
  useEffect(() => {
    document
      .getElementById("admin-main-content")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const { data: ordersData, isLoading } = useAdminOrders({
    status: statusFilter,
    page,
    perPage: 8,
  });
  const updateStatus = useUpdateOrderStatus();

  const statusOptions = [
    { value: "", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "primary";
      case "shipped":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    await updateStatus.mutateAsync({
      id: orderId,
      status: newStatus as
        | "pending"
        | "processing"
        | "shipped"
        | "completed"
        | "cancelled",
    });
  };

  // Filter orders by search query
  const filteredOrders = ordersData?.data?.filter(
    (order: { tracking_id?: string; id: number }) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        order.tracking_id?.toLowerCase().includes(query) ||
        order.id.toString().includes(query)
      );
    },
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Orders Management</h1>
            <p className="text-[var(--color-text-muted)]">
              Manage and track all customer orders
            </p>
          </div>
        </div>

        {/* Filter Tabs + Search */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === option.value
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by Tracking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-sm focus:outline-none focus:border-[var(--color-primary)] w-64"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-6 w-32 skeleton rounded" />
                    <div className="h-4 w-48 skeleton rounded" />
                  </div>
                  <div className="h-8 w-24 skeleton rounded" />
                </div>
              </Card>
            ))
          ) : filteredOrders?.length === 0 ? (
            <Card className="p-12 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-[var(--color-text-muted)] mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-xl font-semibold mb-2">No orders found</p>
              <p className="text-[var(--color-text-muted)]">
                {searchQuery
                  ? "No orders match your search"
                  : statusFilter
                    ? "Try changing the status filter"
                    : "Orders will appear here when customers make purchases"}
              </p>
            </Card>
          ) : (
            filteredOrders?.map(
              (order: {
                id: number;
                user_id: number;
                status:
                  | "pending"
                  | "processing"
                  | "shipped"
                  | "completed"
                  | "cancelled";
                total: number;
                items: Array<{
                  id: number;
                  product_title: string;
                  quantity: number;
                  price: number;
                }>;
                created_at: string;
                tracking_id?: string | null;
              }) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold font-mono">
                              {order.tracking_id || `Order #${order.id}`}
                            </h3>
                            <Badge
                              variant={getStatusBadgeVariant(order.status)}
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-[var(--color-text-muted)] mt-1">
                            {new Date(order.created_at).toLocaleString()} •
                            Customer #{order.user_id}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-bold text-[var(--color-primary)]">
                            ${Number(order.total).toFixed(2)}
                          </p>
                          {/* View Detail Button */}
                          <Link
                            to={`/admin/orders/${order.tracking_id || order.id}`}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 rounded-full hover:bg-[var(--color-primary)]/20 transition-colors"
                          >
                            View Detail
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="border-t border-[var(--color-border)] pt-4 mb-4">
                        <p className="text-sm text-[var(--color-text-muted)] mb-2">
                          Items:
                        </p>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span>
                                {item.product_title} × {item.quantity}
                              </span>
                              <span className="font-medium">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                        <p className="text-sm text-[var(--color-text-muted)]">
                          Update Status:
                        </p>
                        <div className="flex gap-2">
                          {order.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusChange(order.id, "processing")
                              }
                              isLoading={updateStatus.isPending}
                            >
                              Mark Processing
                            </Button>
                          )}
                          {order.status === "processing" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusChange(order.id, "shipped")
                              }
                              isLoading={updateStatus.isPending}
                            >
                              Mark Shipped
                            </Button>
                          )}
                          {order.status === "shipped" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                handleStatusChange(order.id, "completed")
                              }
                              isLoading={updateStatus.isPending}
                            >
                              Mark Completed
                            </Button>
                          )}
                          {["pending", "processing"].includes(order.status) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[var(--color-error)]"
                              onClick={() =>
                                handleStatusChange(order.id, "cancelled")
                              }
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ),
            )
          )}
        </div>

        {/* Pagination - Duralux Style */}
        {ordersData?.meta && ordersData.meta.last_page > 1 && (
          <div className="mt-8 bg-[var(--color-bg-elevated)] rounded-xl border border-[var(--color-border)] p-4 flex items-center justify-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Current Page */}
            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-blue-500/30">
              {page}
            </button>

            {/* Next Page Number */}
            {page < ordersData.meta.last_page && (
              <button
                onClick={() => setPage(page + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] transition-all"
              >
                {page + 1}
              </button>
            )}

            {/* Ellipsis and Last Page */}
            {ordersData.meta.last_page > page + 2 && (
              <>
                <div className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]"></div>
                <button
                  onClick={() => setPage(ordersData.meta.last_page)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] transition-all"
                >
                  {ordersData.meta.last_page}
                </button>
              </>
            )}

            {/* Next Button */}
            <button
              onClick={() =>
                setPage((p) => Math.min(ordersData.meta.last_page, p + 1))
              }
              disabled={page >= ordersData.meta.last_page}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrdersPage;
