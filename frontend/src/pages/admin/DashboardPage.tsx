import { Link, useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useDashboardStats } from "../../hooks/useOrders";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const DashboardPage = () => {
  const location = useLocation();
  const { data: stats, isLoading } = useDashboardStats();

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    },
    { label: "Back to Store", href: "/", icon: "M10 19l-7-7m0 0l7-7m-7 7h18" },
  ];

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
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] p-4 sticky top-0">
          {/* Logo */}
          <Link to="/admin" className="flex items-center gap-2 mb-8 px-2">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <div>
              <span className="font-bold text-lg block">T-Store</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Admin Panel
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
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
                  <Card className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          {stat.title}
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                          {isLoading ? (
                            <span className="inline-block w-20 h-7 skeleton rounded" />
                          ) : (
                            stat.value
                          )}
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-lg bg-[var(--color-bg-surface)] ${stat.color}`}
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
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Revenue by Period */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <Card.Header>
                  <h2 className="font-semibold">Revenue Overview</h2>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-4">
                    {[
                      {
                        label: "Today",
                        value: stats?.revenueByPeriod.day || 0,
                      },
                      {
                        label: "This Week",
                        value: stats?.revenueByPeriod.week || 0,
                      },
                      {
                        label: "This Month",
                        value: stats?.revenueByPeriod.month || 0,
                      },
                      {
                        label: "This Year",
                        value: stats?.revenueByPeriod.year || 0,
                      },
                    ].map((period) => (
                      <div
                        key={period.label}
                        className="flex items-center justify-between"
                      >
                        <span className="text-[var(--color-text-muted)]">
                          {period.label}
                        </span>
                        <span className="font-semibold">
                          ${period.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              {/* Recent Orders */}
              <Card>
                <Card.Header>
                  <h2 className="font-semibold">Recent Orders</h2>
                </Card.Header>
                <Card.Body className="p-0">
                  {isLoading ? (
                    <div className="p-4 space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-12 skeleton rounded" />
                      ))}
                    </div>
                  ) : stats?.recentOrders.length === 0 ? (
                    <p className="p-4 text-center text-[var(--color-text-muted)]">
                      No orders yet
                    </p>
                  ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                      {stats?.recentOrders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4"
                        >
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-[var(--color-text-muted)]">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ${order.total.toFixed(2)}
                            </p>
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
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </motion.div>

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
