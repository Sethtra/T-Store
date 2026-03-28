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
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Orders Management</h1>
            <p className="text-[var(--color-text-muted)]">
              Manage and track all customer orders
            </p>
          </div>
        </div>

        {/* Filter Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-none">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
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
          <div className="relative w-full sm:w-auto">
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
              className="pl-10 pr-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-sm focus:outline-none focus:border-[var(--color-primary)] w-full sm:w-64"
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
                    <div className="p-3 md:p-4 lg:p-6">
                      {/* Order Header */}
                      <div className="flex flex-row justify-between items-start mb-3 gap-2 w-full min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-sm md:text-lg font-bold text-[var(--color-text-primary)] truncate">
                              {order.tracking_id || `#${order.id}`}
                            </h3>
                            <Badge
                              variant={getStatusBadgeVariant(order.status)}
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-[10px] md:text-xs text-[var(--color-text-muted)] font-medium">
                            {new Date(order.created_at).toLocaleDateString()} •
                            Customer #{order.user_id}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm md:text-lg font-bold text-[var(--color-primary)]">
                            ${Number(order.total).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Items Summary - compact on mobile */}
                      <div className="border-t border-[var(--color-border)] pt-2 md:pt-3 mb-2 md:mb-3">
                        <div className="flex items-center justify-between mt-1 mb-2 w-full min-w-0">
                          <p className="text-[10px] md:text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider shrink-0">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </p>
                          <Link
                            to={`/admin/orders/${order.tracking_id || order.id}`}
                            className="text-[10px] md:text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 bg-[var(--color-primary)]/10 px-2 py-1 rounded-md transition-colors hover:bg-[var(--color-primary)]/20 shrink-0 ml-2"
                          >
                            View Detail
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                        <div className="space-y-1.5">
                          {order.items.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between text-[11px] md:text-sm gap-2"
                            >
                              <span className="truncate flex-1 text-[var(--color-text-primary)] font-medium">
                                {item.product_title} <span className="text-[var(--color-text-muted)] ml-1">× {item.quantity}</span>
                              </span>
                              <span className="font-semibold text-[var(--color-text-primary)] flex-shrink-0">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-[10px] text-[var(--color-text-muted)] pt-0.5 font-medium">
                              +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Actions - compact */}
                      <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-[var(--color-border)] gap-2 w-full min-w-0">
                        <p className="text-[10px] md:text-sm font-semibold text-[var(--color-text-muted)] hidden sm:block uppercase tracking-wider">
                          Update Status
                        </p>
                        <div className="flex flex-row gap-2 flex-wrap sm:ml-auto">
                          {order.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusChange(order.id, "processing")
                              }
                              isLoading={updateStatus.isPending}
                              className="justify-center text-[10px] md:text-xs px-3 py-1.5 shrink-0"
                            >
                              Process
                            </Button>
                          )}
                          {order.status === "processing" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusChange(order.id, "shipped")
                              }
                              isLoading={updateStatus.isPending}
                              className="justify-center text-[10px] md:text-xs px-3 py-1.5 shrink-0"
                            >
                              Ship
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
                              className="justify-center text-[10px] md:text-xs px-3 py-1.5 shrink-0"
                            >
                              Complete
                            </Button>
                          )}
                          {["pending", "processing"].includes(order.status) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="justify-center text-[var(--color-error)] text-[10px] md:text-xs px-3 py-1.5 shrink-0"
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
