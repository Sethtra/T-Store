import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  useSalesSummary,
  useRevenueChart,
  useTopProducts,
  exportOrdersCsv,
  exportProductsCsv,
  exportUsersCsv
} from '../../hooks/useReports';
import Button from '../../components/ui/Button';
import AdminLayout from '../../components/admin/AdminLayout';

// Utility for positive/negative change class logic
const getChangeClass = (change: number) => {
  if (change > 0) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  if (change < 0) return 'text-red-500 bg-red-500/10 border-red-500/20';
  return 'text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] border-[var(--color-border)]';
};

const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ReportsPage = () => {
  const [days, setDays] = useState(30);

  const { data: summaryData, isLoading: summaryLoading } = useSalesSummary(days);
  const { data: revenueData, isLoading: revenueLoading } = useRevenueChart(days);
  const { data: topProductsData, isLoading: productsLoading } = useTopProducts(days);

  const isLoading = summaryLoading || revenueLoading || productsLoading;

  return (
    <AdminLayout>
      <div className="w-full px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Reports & Analytics
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Gain insights into your store's performance
          </p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex bg-[var(--color-bg-elevated)] p-1 rounded-lg border border-[var(--color-border)]">
          {[7, 30, 90, 365].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                days === d
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]'
              }`}
            >
              {d === 7 ? '7 Days' : d === 30 ? '30 Days' : d === 90 ? '3 Months' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Revenue',
            value: formatCurrency(summaryData?.summary.revenue.value || 0),
            change: summaryData?.summary.revenue.change || 0,
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          {
            title: 'Total Orders',
            value: summaryData?.summary.orders.value || 0,
            change: summaryData?.summary.orders.change || 0,
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            )
          },
          {
            title: 'Avg Order Value',
            value: formatCurrency(summaryData?.summary.avg_order_value.value || 0),
            change: summaryData?.summary.avg_order_value.change || 0,
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )
          },
          {
            title: 'New Customers',
            value: summaryData?.summary.new_customers.value || 0,
            change: summaryData?.summary.new_customers.change || 0,
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )
          }
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.title}
            className="bg-[var(--color-bg-elevated)] p-6 rounded-2xl border border-[var(--color-border)] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:-rotate-12 duration-300">
              {stat.icon}
            </div>
            
            <h3 className="text-[var(--color-text-muted)] font-medium text-sm">{stat.title}</h3>
            
            <div className="mt-4 flex items-baseline gap-4">
              {isLoading ? (
                <div className="h-8 w-24 bg-[var(--color-border)] animate-pulse rounded"></div>
              ) : (
                <>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getChangeClass(stat.change)}`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">vs previous {days} days</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-[var(--color-bg-elevated)] p-6 rounded-2xl border border-[var(--color-border)]">
          <h3 className="font-bold text-lg mb-6">Revenue Overview</h3>
          <div className="h-[400px] w-full">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-t-[var(--color-primary)] border-[var(--color-border)] rounded-full animate-spin"></div>
              </div>
            ) : revenueData && revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--color-text-muted)" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                    tickFormatter={(val) => {
                      // format date to short readable
                      const date = new Date(val);
                      return days > 90 
                        ? date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
                        : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="var(--color-text-muted)" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                    dx={-10}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="var(--color-text-muted)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-bg-elevated)', 
                      borderColor: 'var(--color-border)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    formatter={(value: any, name: any) => {
                      if (name === 'revenue') return [`$${value.toFixed(2)}`, 'Revenue'];
                      if (name === 'orders_count') return [value, 'Orders'];
                      return [value, name];
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue"
                    stroke="var(--color-primary)" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: 'var(--color-primary)' }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="orders_count" 
                    name="orders_count"
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-xl">
                No revenue data available for this period.
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-[var(--color-bg-elevated)] p-6 rounded-2xl border border-[var(--color-border)]">
          <h3 className="font-bold text-lg mb-6">Top Selling Products</h3>
          <div className="h-[400px] w-full">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-t-[var(--color-primary)] border-[var(--color-border)] rounded-full animate-spin"></div>
              </div>
            ) : topProductsData && topProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="title" 
                    type="category" 
                    stroke="var(--color-text-primary)" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={false}
                    width={100}
                    tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
                  />
                  <Tooltip 
                    cursor={{fill: 'var(--color-bg-surface)'}}
                    contentStyle={{ 
                      backgroundColor: 'var(--color-bg-elevated)', 
                      borderColor: 'var(--color-border)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'total_revenue') return [`$${value.toFixed(2)}`, 'Revenue'];
                      if (name === 'total_quantity') return [value, 'Units Sold'];
                      return [value, name];
                    }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="total_revenue" name="Revenue" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="total_quantity" name="Units" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 border border-dashed border-[var(--color-border)] rounded-xl">
                <span className="text-4xl mb-3 opacity-20">📦</span>
                <p className="text-sm font-medium text-[var(--color-text-muted)]">No sales data found for the selected timeframe.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Export section */}
      <div className="bg-[var(--color-bg-elevated)] p-6 rounded-2xl border border-[var(--color-border)]">
        <h3 className="font-bold text-lg mb-2">Data Export</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">Download your store data as CSV files for analysis in Excel or other tools.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-[var(--color-border)] rounded-xl flex flex-col items-start gap-3 bg-[var(--color-bg-surface)]">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-sm">Orders Export</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Download order details (last {days} days)</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportOrdersCsv(days)} className="mt-2 w-full">
              Download CSV
            </Button>
          </div>

          <div className="p-4 border border-[var(--color-border)] rounded-xl flex flex-col items-start gap-3 bg-[var(--color-bg-surface)]">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-sm">Inventory Export</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Download current product stock levels</p>
            </div>
            <Button variant="outline" size="sm" onClick={exportProductsCsv} className="mt-2 w-full">
              Download CSV
            </Button>
          </div>

          <div className="p-4 border border-[var(--color-border)] rounded-xl flex flex-col items-start gap-3 bg-[var(--color-bg-surface)]">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-sm">Customers Export</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Download user data and total spending</p>
            </div>
            <Button variant="outline" size="sm" onClick={exportUsersCsv} className="mt-2 w-full">
              Download CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default ReportsPage;
