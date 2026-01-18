import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useDashboardStats } from "../../hooks/useOrders";
import AdminLayout from "../../components/admin/AdminLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const DashboardPage = () => {
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    {
      title: "Total Revenue",
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "-",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "text-[var(--color-success)]",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders.toLocaleString() || "-",
      icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
      color: "text-[var(--color-primary)]",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders.toString() || "-",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "text-[var(--color-warning)]",
    },
    {
      title: "This Month",
      value: stats ? `$${stats.revenueByPeriod.month.toLocaleString()}` : "-",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      color: "text-[var(--color-primary-light)]",
    },
  ];

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-8">Dashboard Overview</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 relative overflow-hidden group hover:shadow-lg transition-shadow border-[var(--color-border)]">
                <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-[var(--color-bg-surface)] ${stat.color} bg-opacity-10`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={stat.icon}
                        />
                      </svg>
                    </div>
                    {/* Optional: Add percentage trend here if available */}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-muted)] mb-1">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">
                      {isLoading ? (
                        <span className="inline-block w-24 h-8 skeleton rounded" />
                      ) : (
                        stat.value
                      )}
                    </h3>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Overview - visual improvements */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <Card.Header>
                <h2 className="text-lg font-bold">Revenue Overview</h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-6">
                  {/* Custom 'Bar Chart' using progress bars */}
                  {[
                    {
                      label: "Today",
                      value: stats?.revenueByPeriod.day || 0,
                      color: "bg-blue-500",
                    },
                    {
                      label: "This Week",
                      value: stats?.revenueByPeriod.week || 0,
                      color: "bg-indigo-500",
                    },
                    {
                      label: "This Month",
                      value: stats?.revenueByPeriod.month || 0,
                      color: "bg-violet-500",
                    },
                    {
                      label: "This Year",
                      value: stats?.revenueByPeriod.year || 0,
                      color: "bg-purple-500",
                    },
                  ].map((period, idx) => {
                    // Simple max value logic for bar width visualization (mock max if needed)
                    const maxValue = Math.max(
                      stats?.revenueByPeriod.year || 1,
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
          <div className="lg:col-span-2">
            <Card className="h-full overflow-hidden">
              <Card.Header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50 pb-4">
                <h2 className="text-lg font-bold">Recent Orders</h2>
                <Link
                  to="/admin/orders"
                  className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors"
                >
                  View All Orders
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
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--color-bg-surface)] text-xs uppercase text-[var(--color-text-muted)] font-semibold">
                      <tr>
                        <th className="px-6 py-3 text-left">Order ID</th>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3 text-right">Total</th>
                        <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-8 text-center ml-auto mr-auto"
                          >
                            <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
                          </td>
                        </tr>
                      ) : stats?.recentOrders.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-[var(--color-text-muted)]"
                          >
                            No recent orders found.
                          </td>
                        </tr>
                      ) : (
                        stats?.recentOrders.slice(0, 5).map((order) => (
                          <tr
                            key={order.id}
                            className="hover:bg-[var(--color-bg-surface)] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className="font-mono font-medium text-sm text-[var(--color-text-primary)]">
                                {order.tracking_id || `#${order.id}`}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Badge
                                variant={
                                  order.status === "completed"
                                    ? "success"
                                    : order.status === "processing"
                                      ? "warning"
                                      : order.status === "pending"
                                        ? "primary"
                                        : "default"
                                }
                                size="sm"
                              >
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-[var(--color-text-primary)]">
                              ${Number(order.total).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link
                                to={`/admin/orders/${order.tracking_id || order.id}`}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                                title="View Details"
                              >
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
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </motion.div>

      <Outlet />
    </AdminLayout>
  );
};

export default DashboardPage;
