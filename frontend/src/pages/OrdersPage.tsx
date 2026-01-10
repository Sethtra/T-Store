import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useOrders, type Order } from "../hooks/useOrders";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

const OrdersPage = () => {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) {
    return (
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-[var(--color-bg-elevated)] rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">My Orders</h1>
        <p className="text-[var(--color-error)]">Failed to load orders</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="py-8 min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">My Orders</h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          You haven't placed any orders yet.
        </p>
        <Link to="/products">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

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

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Order Info */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">Order #{order.id}</h3>
                    <Badge
                      variant={
                        getStatusColor(order.status) as
                          | "default"
                          | "primary"
                          | "success"
                          | "warning"
                          | "error"
                      }
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Placed on{" "}
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Total */}
                <div className="text-right">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Total
                  </p>
                  <p className="text-xl font-bold text-[var(--color-primary)]">
                    ${Number(order.total).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <div className="flex flex-wrap gap-4">
                  {order.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-[var(--color-bg-surface)] rounded-lg p-2 pr-4"
                    >
                      <div className="w-12 h-12 bg-[var(--color-bg-elevated)] rounded-lg flex items-center justify-center text-xs text-[var(--color-text-muted)]">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate max-w-[150px]">
                          {item.product_title}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          ${Number(item.price).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="flex items-center justify-center px-4 text-sm text-[var(--color-text-muted)]">
                      +{order.items.length - 4} more items
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
