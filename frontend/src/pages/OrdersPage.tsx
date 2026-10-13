import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { useOrders, type Order } from "../hooks/useOrders";
import Button from "../components/ui/Button";
import OrderDetailsModal from "../components/orders/OrderDetailsModal";
import InvoiceModal from "../components/orders/InvoiceModal";
import { useTranslation } from "react-i18next";
import { formatUSD } from "../utils/money";

const ORDERS_PER_PAGE = 8;

const OrdersPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: orders, isLoading, error } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Re-render every minute to update countdowns
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate remaining time for 24hr payment window
  const getCountdown = (createdAt: string) => {
    const deadline = new Date(createdAt).getTime() + 24 * 60 * 60 * 1000;
    const remaining = deadline - currentTime;
    if (remaining <= 0) return null;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}${i18n.language === 'kh' ? 'ម៉ោង' : 'h'} ${minutes}${i18n.language === 'kh' ? 'នាទី' : 'm'}`;
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
    if (filterStatus === "all") return true;
    
    if (filterStatus === "pending") {
      return order.payment_status === "pending" || order.payment_status === "failed";
    }
    
    // For all other tabs, don't show unpaid orders (they belong in Payment Pending)
    if (order.payment_status === "pending" || order.payment_status === "failed") {
      return false;
    }

    if (filterStatus === "processing") {
      return order.status === "pending" || order.status === "processing";
    }
    if (filterStatus === "shipped") return order.status === "shipped";
    if (filterStatus === "completed") return order.status === "completed";
    if (filterStatus === "cancelled") return order.status === "cancelled";
    
    return order.status === filterStatus.toLowerCase();
  });

  // Pagination logic
  const totalFiltered = filteredOrders?.length || 0;
  const totalPages = Math.ceil(totalFiltered / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders?.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const handleFilterChange = (tab: string) => {
    setFilterStatus(tab);
    setCurrentPage(1);
  };

  const tabs = [
    { id: "all", label: t("orders.all") },
    { id: "pending", label: t("orders.pending") },
    { id: "processing", label: t("orders.processing") },
    { id: "shipped", label: t("orders.shipped") },
    { id: "completed", label: t("orders.completed") },
    { id: "cancelled", label: t("orders.cancelled") },
  ];

  const isKh = i18n.language === "kh";
  const wrap = "max-w-[1100px] mx-auto px-4 md:px-6 lg:px-8 pt-6 md:pt-10";
  const dateFmt = (d: string) =>
    new Date(d).toLocaleDateString(isKh ? "km-KH" : "en-US", { day: "numeric", month: "short", year: "numeric" });

  const statusPill = (order: Order) => {
    let label: string;
    let tone: "warning" | "error" | "neutral" | "success" | "info";
    if (order.payment_status === "pending") {
      label = t("orders.pending");
      tone = "warning";
    } else if (order.payment_status === "failed") {
      label = t("orders.failed");
      tone = "error";
    } else if (order.payment_status === "cancelled" || order.status === "cancelled") {
      label = t("orders.cancelled");
      tone = "neutral";
    } else if (order.status === "completed") {
      label = t("orders.completed");
      tone = "success";
    } else {
      label = t(`orders.${order.status}`);
      tone = "info";
    }
    const tones = {
      warning: "text-[var(--color-warning)]",
      error: "text-[var(--color-error)]",
      neutral: "text-[var(--color-text-muted)]",
      success: "text-[var(--color-success)]",
      info: "text-[var(--color-info)]",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${tones[tone]}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
        {label}
      </span>
    );
  };

  const isUnpaid = (o: Order) => o.payment_status === "pending";

  const actions = (order: Order) =>
    isUnpaid(order) ? (
      <Button size="sm" onClick={() => navigate(`/checkout?retry_order=${order.id}`)}>
        {t("orders.pay_now")}
      </Button>
    ) : (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => handleViewInvoice(order)}>
          {t("orders.invoice")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleViewDetails(order)}>
          {t("orders.details")}
        </Button>
      </div>
    );

  const countdownCell = (order: Order) => {
    if (!isUnpaid(order)) return null;
    const left = getCountdown(order.created_at);
    return (
      <span className="tabular text-sm font-medium text-[var(--color-error)]">
        {left ? `${left} ${isKh ? "នៅសល់" : "left to pay"}` : t("orders.expired")}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className={wrap} aria-busy="true">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{t("orders.title")}</h1>
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${wrap} text-center`}>
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">{t("orders.title")}</h1>
        <p role="alert" className="mt-4 text-[var(--color-error)]">
          {t("orders.failed_load")}
        </p>
        <Button className="mt-6" variant="outline" onClick={() => window.location.reload()}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className={wrap}>
      <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{t("orders.title")}</h1>

      {!orders || orders.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-hover)] px-6 py-20 text-center">
          <Package className="h-8 w-8 text-[var(--color-text-muted)]" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold">{t("orders.no_orders")}</h2>
          <p className="mt-1.5 text-[var(--color-text-secondary)]">
            {isKh ? "អ្នកមិនទាន់បានដាក់បញ្ជាទិញណាមួយនៅឡើយទេ។" : "You haven't placed any orders yet."}
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex h-11 items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-on-primary)]"
          >
            {t("orders.start_shopping")}
          </Link>
        </div>
      ) : (
        <>
          {/* Status tabs */}
          <div className="mt-6 -mx-4 overflow-x-auto px-4 scrollbar-hide md:mx-0 md:px-0">
            <div role="tablist" aria-label={t("orders.status")} className="flex gap-1 border-b border-[var(--color-border)] min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={filterStatus === tab.id}
                  onClick={() => handleFilterChange(tab.id)}
                  className={`relative h-11 px-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    filterStatus === tab.id
                      ? "text-[var(--color-text-primary)] after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-[var(--color-text-primary)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders?.length === 0 ? (
            <p className="py-16 text-center text-[var(--color-text-secondary)]">{t("orders.no_orders_category")}</p>
          ) : (
            <>
              {/* Mobile: cards */}
              <ul className="mt-4 space-y-3 md:hidden">
                {paginatedOrders?.map((order) => (
                  <li key={order.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="tabular truncate font-semibold">#{order.tracking_id || order.id}</p>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          {dateFmt(order.created_at)} · {order.items?.length ?? 0} {isKh ? "មុខ" : order.items?.length === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <p className="tabular font-semibold">{formatUSD(order.total)}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      {statusPill(order)}
                      {countdownCell(order)}
                    </div>
                    <div className="mt-4 [&_button]:flex-1 [&>div]:flex [&>div]:w-full">{actions(order)}</div>
                  </li>
                ))}
              </ul>

              {/* Desktop: table */}
              <div className="mt-2 hidden md:block">
                <table className="w-full text-left text-[0.9375rem]">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
                      <th scope="col" className="py-3 pr-4 font-medium">{t("orders.tracking_id")}</th>
                      <th scope="col" className="py-3 pr-4 font-medium">{t("orders.date")}</th>
                      <th scope="col" className="py-3 pr-4 font-medium">{t("orders.status")}</th>
                      <th scope="col" className="py-3 pr-4 font-medium text-right">{t("orders.total")}</th>
                      <th scope="col" className="py-3 font-medium text-right">
                        <span className="sr-only">{t("orders.action")}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {paginatedOrders?.map((order) => (
                      <tr key={order.id}>
                        <td className="tabular py-4 pr-4 font-medium">#{order.tracking_id || order.id}</td>
                        <td className="py-4 pr-4 whitespace-nowrap text-[var(--color-text-secondary)]">{dateFmt(order.created_at)}</td>
                        <td className="py-4 pr-4">
                          <div className="flex flex-col gap-0.5">
                            {statusPill(order)}
                            {countdownCell(order)}
                          </div>
                        </td>
                        <td className="tabular py-4 pr-4 text-right font-semibold">{formatUSD(order.total)}</td>
                        <td className="py-4">
                          <div className="flex justify-end">{actions(order)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
                  <p className="tabular text-sm text-[var(--color-text-muted)]">
                    {(currentPage - 1) * ORDERS_PER_PAGE + 1}–{Math.min(currentPage * ORDERS_PER_PAGE, totalFiltered)} / {totalFiltered}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                      <ChevronLeft className="h-4 w-4" />
                      {t("orders.prev")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      {t("orders.next")}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </nav>
              )}
            </>
          )}
        </>
      )}

      <OrderDetailsModal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} order={selectedOrder} />
      <InvoiceModal isOpen={invoiceOpen} onClose={() => setInvoiceOpen(false)} order={selectedOrder} />
    </div>
  );
};

export default OrdersPage;
