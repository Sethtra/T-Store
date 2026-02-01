import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import {
  useDashboardStats,
  useAdminOrders,
  useUpdateOrderStatus,
} from "../../hooks/useOrders";
import AdminLayout from "../../components/admin/AdminLayout";
import Card from "../../components/ui/Card";

const DashboardPage = () => {
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // exact date string YYYY-MM-DD
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const ITEMS_PER_PAGE = 4;
  // Fetch ALL orders (no server-side pagination) - we paginate client-side
  const { data: ordersData, isLoading: isLoadingOrders } = useAdminOrders({});
  const updateStatusMutation = useUpdateOrderStatus();

  const isLoading = isLoadingStats || isLoadingOrders;

  // Helper to get next status in the flow
  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow: Record<string, string> = {
      pending: "processing",
      processing: "shipped",
      shipped: "completed",
    };
    return statusFlow[currentStatus] || null;
  };

  const handleAdvanceStatus = (orderId: number, currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    if (nextStatus) {
      updateStatusMutation.mutate({
        id: orderId,
        status: nextStatus as
          | "pending"
          | "processing"
          | "shipped"
          | "completed"
          | "cancelled",
      });
    }
  };

  // Filter orders based on search, status, and date
  const allOrders = ordersData?.data ?? [];
  const filteredOrders = allOrders.filter((order) => {
    // Search filter - check tracking_id, id, total
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      order.tracking_id?.toLowerCase().includes(searchLower) ||
      order.id.toString().includes(searchQuery) ||
      order.total.toString().includes(searchQuery);

    // Status filter
    const matchesStatus = !statusFilter || order.status === statusFilter;

    // Date filter (exact date match)
    let matchesDate = true;
    if (dateFilter) {
      const orderDate = new Date(order.created_at).toISOString().split("T")[0];
      matchesDate = orderDate === dateFilter;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Client-side pagination on filtered results
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setPage(1);
  };

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Dashboard Stats based on real data
  const dashboardStats = [
    {
      title: "Total Revenue",
      value: stats ? `$${stats.totalRevenue.toLocaleString()} USD` : "-",
      subText: `Today: $${(stats?.revenueByPeriod?.day ?? 0).toLocaleString()}`,
      icon: <span className="text-[var(--color-success)]">$</span>,
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders.toString() || "-",
      subText: `${stats?.pendingOrders ?? 0} pending`,
      icon: (
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
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
    {
      title: "Registered Users",
      value: stats?.totalUsers?.toString() || "0",
      subText: "Total user accounts",
      icon: (
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      title: "Visitors",
      value: stats?.totalVisitors?.toLocaleString() || "0",
      subText: "Total website visits",
      icon: (
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="w-full px-8 py-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div className="text-[var(--color-text-secondary)] text-sm font-medium">
            <span className="text-[var(--color-text-primary)] font-bold">
              Reports
            </span>{" "}
            | Home &gt; Sales
          </div>
        </div>

        {/* Dashboard Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border border-[var(--color-border)] shadow-sm bg-[var(--color-bg-elevated)]">
                <Card.Body className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      {stat.icon}
                      <span className="text-xs font-medium uppercase tracking-wide">
                        {stat.title}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {stat.subText}
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Overview - visual improvements */}
          <div className="lg:col-span-1">
            <Card className="h-[400px]">
              <Card.Header>
                <h2 className="text-lg font-bold">Revenue Overview</h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-6">
                  {/* Custom 'Bar Chart' using progress bars */}
                  {[
                    {
                      label: "Today",
                      value: stats?.revenueByPeriod?.day ?? 0,
                      color: "bg-blue-500",
                    },
                    {
                      label: "This Week",
                      value: stats?.revenueByPeriod?.week ?? 0,
                      color: "bg-indigo-500",
                    },
                    {
                      label: "This Month",
                      value: stats?.revenueByPeriod?.month ?? 0,
                      color: "bg-violet-500",
                    },
                    {
                      label: "This Year",
                      value: stats?.revenueByPeriod?.year ?? 0,
                      color: "bg-purple-500",
                    },
                  ].map((period, idx) => {
                    // Simple max value logic for bar width visualization
                    const maxValue = Math.max(
                      stats?.revenueByPeriod?.year ?? 1,
                      stats?.revenueByPeriod?.month ?? 1,
                      stats?.revenueByPeriod?.week ?? 1,
                      stats?.revenueByPeriod?.day ?? 1,
                      100,
                    );
                    const percent = Math.min(
                      (period.value / maxValue) * 100,
                      100,
                    );

                    return (
                      <div key={period.label}>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm text-[var(--color-text-muted)]">
                            {period.label}
                          </span>
                          <span className="font-bold text-[var(--color-text-primary)]">
                            ${period.value.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-[var(--color-bg-surface)] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className={`h-full rounded-full ${period.color}`}
                            style={{ minWidth: "5%" }} // Always show at least a sliver
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Recent Orders - Table Layout */}

          {/* Recent Orders - Theme-aware Style */}
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden col-span-2 h-[520px] flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-[var(--color-border)]">
              {/* Title */}
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                Recent Orders
              </h2>

              {/* Search and Filters - Right Side */}
              <div className="flex items-center gap-3">
                {/* Search Input - Compact */}
                <div className="relative w-[160px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
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
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                {/* Date Filter Button with Picker */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowDatePicker(!showDatePicker);
                      setShowStatusDropdown(false);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-bg-surface)] border rounded text-sm transition-colors ${
                      dateFilter
                        ? "border-[var(--color-primary)] text-[var(--color-text-primary)]"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <span>Date</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                  </button>
                  {showDatePicker && (
                    <div className="absolute top-full right-0 mt-1 p-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg shadow-lg z-10">
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => {
                          setDateFilter(e.target.value);
                          handleFilterChange();
                          setShowDatePicker(false);
                        }}
                        className="px-3 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] focus:outline-none"
                      />
                      {dateFilter && (
                        <button
                          onClick={() => {
                            setDateFilter("");
                            handleFilterChange();
                            setShowDatePicker(false);
                          }}
                          className="mt-2 w-full px-3 py-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Filter Button with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowStatusDropdown(!showStatusDropdown);
                      setShowDatePicker(false);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-bg-surface)] border rounded text-sm transition-colors ${
                      statusFilter
                        ? "border-[var(--color-primary)] text-[var(--color-text-primary)]"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <span>Status</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute top-full right-0 mt-1 py-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg shadow-lg z-10 min-w-[140px]">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setStatusFilter(option.value);
                            handleFilterChange();
                            setShowStatusDropdown(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left text-sm transition-colors ${
                            statusFilter === option.value
                              ? "bg-[var(--color-primary)] text-white"
                              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Order Info
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider w-[200px]">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-[var(--color-text-muted)]"
                      >
                        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </td>
                    </tr>
                  ) : !paginatedOrders.length ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-[var(--color-text-muted)]"
                      >
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => {
                      // Mock visuals for Duralux style
                      const progress =
                        order.status === "completed"
                          ? 100
                          : order.status === "shipped"
                            ? 75
                            : order.status === "processing"
                              ? 50
                              : 25;
                      const statusColor =
                        order.status === "completed"
                          ? "text-[#17c666] bg-[#17c666]/10" // Green
                          : order.status === "cancelled"
                            ? "text-[#ef4444] bg-[#ef4444]/10" // Red
                            : order.status === "processing" ||
                                order.status === "shipped"
                              ? "text-[#3454d1] bg-[#3454d1]/10" // Blue
                              : "text-[#ffa21d] bg-[#ffa21d]/10"; // Orange (pending)

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-[var(--color-bg-surface)]/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-bold text-[var(--color-text-primary)]">
                                Order #{order.tracking_id || order.id}
                              </div>
                              <div className="text-xs text-[var(--color-text-muted)]">
                                {order.shipping_email || "No email"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)]">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-[var(--color-text-primary)]">
                            ${Number(order.total).toFixed(2)} USD
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider ${statusColor}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-[var(--color-bg-surface)] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[var(--color-primary)] rounded-full relative"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                                {progress}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Advance Status Button */}
                              {getNextStatus(order.status) && (
                                <button
                                  onClick={() =>
                                    handleAdvanceStatus(order.id, order.status)
                                  }
                                  disabled={updateStatusMutation.isPending}
                                  className="p-1.5 text-[var(--color-text-muted)] hover:text-[#17c666] hover:bg-[#17c666]/10 rounded transition-colors disabled:opacity-50"
                                  title={`Advance to ${getNextStatus(order.status)}`}
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
                              )}
                              {/* View Details Link */}
                              <Link
                                to={`/admin/orders/${order.tracking_id || order.id}`}
                                className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] rounded transition-colors"
                                title="View Details"
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
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Duralux Style */}
            <div className="p-4 border-t border-[#1b2436] flex items-center justify-center gap-2 mt-auto">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b7885] hover:bg-[#1b2436] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Dynamically display pages based on totalPages */}
              <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-blue-500/30">
                {page}
              </button>

              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b7885] hover:bg-[#1b2436] hover:text-white transition-all"
                >
                  {page + 1}
                </button>
              )}

              {totalPages > page + 2 && (
                <>
                  <div className="w-1 h-1 rounded-full bg-[#6b7885]"></div>
                  <button
                    onClick={() => setPage(totalPages)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b7885] hover:bg-[#1b2436] hover:text-white transition-all"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b7885] hover:bg-[#1b2436] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>

        <Outlet />
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
