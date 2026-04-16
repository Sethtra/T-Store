import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useCartStore } from "../stores/cartStore";
import {
  useCreateOrder,
  useCreateStripeIntent,
  useCreatePaywayTransaction,
} from "../hooks/useOrders";
import { useAuthStore } from "../stores/authStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StripeForm from "../components/checkout/StripeForm";

import api from "../lib/api";

// Initialize Stripe outside component
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder",
);

// Step Progress Component
const StepProgress = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { number: 1, label: "Contact & Shipping" },
    { number: 2, label: "Payment" },
  ];

  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center"
          >
            <motion.div
              className={`step-indicator ${
                currentStep > step.number
                  ? "completed"
                  : currentStep === step.number
                    ? "active"
                    : "pending"
              }`}
            >
              {currentStep > step.number ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                step.number
              )}
            </motion.div>
            <span
              className={`mt-2 text-sm font-medium ${
                currentStep >= step.number
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              {step.label}
            </span>
          </motion.div>
          {index < steps.length - 1 && (
            <div
              className={`step-line mx-4 w-16 md:w-24 ${
                currentStep > step.number ? "completed" : ""
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Payment Method Card Component
const PaymentMethodCard = ({
  id: _id,
  selected,
  onSelect,
  icon,
  title,
  description,
  accentColor,
}: {
  id: string;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={`relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group ${
      selected
        ? `border-[${accentColor}] bg-gradient-to-br from-[${accentColor}]/5 to-[${accentColor}]/10 shadow-lg shadow-[${accentColor}]/10`
        : "border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:shadow-md"
    }`}
    style={
      selected
        ? {
            borderColor: accentColor,
            background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}15)`,
            boxShadow: `0 8px 25px -5px ${accentColor}20`,
          }
        : {}
    }
  >
    {/* Selection indicator */}
    <div className="absolute top-4 right-4">
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
          selected ? "border-transparent" : "border-[var(--color-border)]"
        }`}
        style={selected ? { backgroundColor: accentColor } : {}}
      >
        {selected && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3.5 h-3.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        )}
      </div>
    </div>

    <div className="flex items-start gap-4">
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          selected ? "scale-110" : "group-hover:scale-105"
        }`}
        style={{
          background: selected
            ? `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`
            : `${accentColor}15`,
        }}
      >
        <div
          style={{ color: selected ? "white" : accentColor }}
          className="text-2xl"
        >
          {icon}
        </div>
      </div>
      <div className="flex-1 pr-6">
        <h4
          className={`font-bold text-base mb-1 transition-colors ${
            selected ? "" : "text-[var(--color-text-primary)]"
          }`}
          style={selected ? { color: accentColor } : {}}
        >
          {title}
        </h4>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </button>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const createOrder = useCreateOrder();
  const createStripeIntent = useCreateStripeIntent();
  const createPaywayTransaction = useCreatePaywayTransaction();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">(
    "delivery",
  );
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "payway">(
    "stripe",
  );

  // Payment Flow State
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [retryOrder, setRetryOrder] = useState<any>(null);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(
    null,
  );
  const [paywayData, setPaywayData] = useState<{
    qrImage?: string;
    deeplink?: string;
  } | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Handle retry order from URL param
  useEffect(() => {
    const retryOrderId = searchParams.get("retry_order");
    if (retryOrderId) {
      setIsRetryMode(true);
      setCreatedOrderId(Number(retryOrderId));
      // Load order details
      api
        .get(`/orders/${retryOrderId}`)
        .then((res) => {
          setRetryOrder(res.data);
        })
        .catch(() => {
          setPaymentError(
            "Could not load order. It may have already been paid.",
          );
        });
    }
  }, [searchParams]);

  // Check if returning from PayWay payment
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      clearCart();
      setOrderSuccess(true);
    }
  }, [searchParams, clearCart]);

  // Polling for PayWay Status
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (currentStep === 2 && paymentMethod === "payway" && createdOrderId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/orders/${createdOrderId}`);
          if (res.data.payment_status === "paid") {
            handlePaymentSuccess();
          }
        } catch (err) {
          console.error("Status polling failed", err);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [currentStep, paymentMethod, createdOrderId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Step 1: Create Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setPaymentError(null);
    setIsCreatingOrder(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          attributes: item.attributes,
        })),
        payment_method: paymentMethod,
        delivery_method: deliveryMethod,
        shipping_name: `${formData.firstName} ${formData.lastName}`,
        shipping_email: formData.email,
        shipping_phone: formData.phone,
        shipping_address:
          deliveryMethod === "delivery"
            ? {
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
                country: formData.country,
              }
            : null,
      };

      const res = await createOrder.mutateAsync(orderData);
      const orderId = res.order.id;
      setCreatedOrderId(orderId);

      // Clear cart immediately after order is created
      clearCart();

      if (paymentMethod === "stripe") {
        // Stripe: get client secret and show card form
        const intentRes = await createStripeIntent.mutateAsync({
          order_id: orderId,
        });
        setStripeClientSecret(intentRes.client_secret);
        setCurrentStep(2);
      } else if (paymentMethod === "payway") {
        // PayWay: Server-to-Server created a QR Code payload
        const paywayRes = await createPaywayTransaction.mutateAsync({
          order_id: orderId,
        });
        if (paywayRes.payway_response?.qrImage) {
          setPaywayData({
            qrImage: paywayRes.payway_response.qrImage,
            deeplink: paywayRes.payway_response.abapay_deeplink,
          });
          setCurrentStep(2);
        } else {
          throw new Error(
            paywayRes.payway_response.status?.message ||
              "Failed to generate ABA QR Code",
          );
        }
      }
    } catch (error: any) {
      setPaymentError(
        error.response?.data?.message ||
          "Failed to create order. Please try again.",
      );
      console.error("Order creation failed", error);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Step 2: Handle Successful Payment
  const handlePaymentSuccess = () => {
    setOrderSuccess(true);
  };

  const subtotal = totalPrice();
  const shipping = deliveryMethod === "pickup" ? 0 : subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (items.length === 0 && !orderSuccess && !isRetryMode && !createdOrderId) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[70vh] flex flex-col items-center justify-center"
      >
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <Link to="/products">
          <Button size="lg" className="mt-4">
            Continue Shopping
          </Button>
        </Link>
      </motion.div>
    );
  }

  if (orderSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[70vh] flex flex-col items-center justify-center"
      >
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-3">Payment Successful!</h2>
        <p className="text-[var(--color-text-muted)] mb-8">
          Your order has been placed and is being processed.
        </p>
        <div className="flex gap-4">
          <Link to="/orders">
            <Button variant="outline" size="lg">
              View Orders
            </Button>
          </Link>
          <Link to="/products">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  // Retry Payment Mode: show payment method selection and pay button
  if (isRetryMode && retryOrder && !orderSuccess) {
    const handleRetryPay = async () => {
      if (!createdOrderId) return;
      setPaymentError(null);
      setIsCreatingOrder(true);

      try {
        // Update payment method on backend
        await api.post(`/orders/${createdOrderId}/retry-payment`, {
          payment_method: paymentMethod,
        });

        if (paymentMethod === "stripe") {
          const intentRes = await createStripeIntent.mutateAsync({
            order_id: createdOrderId,
          });
          setStripeClientSecret(intentRes.client_secret);
          setCurrentStep(2);
        } else if (paymentMethod === "payway") {
          const paywayRes = await createPaywayTransaction.mutateAsync({
            order_id: createdOrderId,
          });
          if (paywayRes.payway_response?.qrImage) {
            setPaywayData({
              qrImage: paywayRes.payway_response.qrImage,
              deeplink: paywayRes.payway_response.abapay_deeplink,
            });
            setCurrentStep(2);
          } else {
            throw new Error(
              paywayRes.payway_response.status?.message ||
                "Failed to generate QR Code",
            );
          }
        }
      } catch (error: any) {
        setPaymentError(
          error.response?.data?.message ||
            "Failed to process payment. Please try again.",
        );
      } finally {
        setIsCreatingOrder(false);
      }
    };

    // If already moved to step 2 (payment form), show that instead
    if (currentStep === 2) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pb-12 md:pb-16"
          style={{ paddingTop: "140px" }}
        >
          <div className="container lg:px-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Complete Payment</h1>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
              >
                ← Change Method
              </button>
            </div>
            <div className="bg-[var(--color-bg-elevated)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
              {paymentMethod === "stripe" && stripeClientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: stripeClientSecret,
                    appearance: { theme: "stripe" },
                  }}
                >
                  <StripeForm
                    clientSecret={stripeClientSecret}
                    onSuccess={handlePaymentSuccess}
                    onError={setPaymentError}
                  />
                </Elements>
              )}
              {paymentMethod === "payway" && paywayData && (
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="mb-4 text-center">
                    <img
                      src="https://checkout.payway.com.kh/images/aba-payway-logo.svg"
                      alt="ABA PayWay"
                      className="h-8 mx-auto mb-2"
                    />
                    <p className="text-[var(--color-text-muted)] text-sm">
                      Scan with ABA Mobile or any KHQR Bank app
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-3xl shadow-md border-2 border-red-500/20 mb-6 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img
                      src={paywayData.qrImage}
                      alt="Payment QR Code"
                      className="w-64 h-64 object-contain relative z-10 mix-blend-multiply"
                    />
                  </div>

                  {paywayData.deeplink && (
                    <div className="flex flex-col items-center w-full max-w-sm gap-3">
                      <span className="text-xs text-[var(--color-text-muted)] font-medium tracking-wider uppercase">
                        Or pay directly on mobile
                      </span>
                      <a
                        href={paywayData.deeplink}
                        className="w-full flex justify-center items-center gap-2 bg-[#E21937] hover:bg-[#C1152F] text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17,1H7A2,2,0,0,0,5,3V21a2,2,0,0,0,2,2H17a2,2,0,0,0,2-2V3A2,2,0,0,0,17,1ZM12,21a1,1,0,1,1,1-1A1,1,0,0,1,12,21ZM17,18H7V4H17Z" />
                        </svg>
                        Pay with ABA Mobile
                      </a>
                    </div>
                  )}

                  <div className="mt-8 flex flex-col items-center justify-center gap-3 w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium text-[var(--color-text-muted)]">
                        Waiting for you to scan...
                      </span>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          await api.post("/payment/payway/simulate", {
                            order_id: createdOrderId,
                          });
                        } catch (e) {
                          console.error("Simulation failed", e);
                        }
                      }}
                      className="mt-4 text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-primary)] underline decoration-dashed transition-colors"
                    >
                      [ Simulate Payment (Dev Mode) ]
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pb-12 md:pb-16"
        style={{ paddingTop: "140px" }}
      >
        <div className="container lg:px-8 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Retry Payment</h1>
          <p className="text-[var(--color-text-muted)] mb-8">
            Order #{retryOrder.tracking_id || retryOrder.id} · Total:{" "}
            <span className="font-bold text-[var(--color-text-primary)]">
              ${Number(retryOrder.total).toFixed(2)}
            </span>
          </p>

          {paymentError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl mb-6">
              {paymentError}
            </div>
          )}

          {/* Order Items */}
          <div className="bg-[var(--color-bg-elevated)]/50 backdrop-blur-xl p-6 rounded-2xl border border-[var(--color-border)]/50 mb-8">
            <h3 className="font-bold mb-4">Order Items</h3>
            <div className="space-y-3">
              {retryOrder.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span>
                    {item.product_title} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    ${Number(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4 mb-8">
            <h3 className="font-bold">Choose Payment Method</h3>
            <PaymentMethodCard
              id="stripe"
              selected={paymentMethod === "stripe"}
              onSelect={() => setPaymentMethod("stripe")}
              accentColor="#635BFF"
              title="Credit / Debit Card"
              description="Pay securely with Visa, Mastercard, or American Express via Stripe"
              icon={
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              }
            />
            <PaymentMethodCard
              id="payway"
              selected={paymentMethod === "payway"}
              onSelect={() => setPaymentMethod("payway")}
              accentColor="#E21937"
              title="ABA PayWay"
              description="Pay with ABA Mobile, KHQR, or local bank cards via ABA PayWay"
              icon={
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              }
            />
          </div>

          <Button
            size="lg"
            fullWidth
            isLoading={isCreatingOrder}
            onClick={handleRetryPay}
            className="py-4 text-base rounded-xl bg-[var(--color-primary)] text-white border-none shadow-lg shadow-blue-500/20"
          >
            {paymentMethod === "stripe"
              ? "Pay with Card"
              : "Pay with ABA PayWay"}
          </Button>

          <Link
            to="/orders"
            className="block text-center mt-4 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
          >
            ← Back to My Orders
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-12 md:pb-16"
      style={{ paddingTop: "140px" }}
    >
      <div className="container lg:px-8">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <StepProgress currentStep={currentStep} />
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Form / Payment */}
          <div className="lg:col-span-7 space-y-8">
            {paymentError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                {paymentError}
              </div>
            )}

            <AnimatePresence mode="wait">
              {currentStep === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-xl font-bold mb-6">
                    Shipping & Payment Method
                  </h2>
                  <form
                    id="checkout-form"
                    onSubmit={handleCreateOrder}
                    className="space-y-8"
                  >
                    {/* Delivery Method */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod("delivery")}
                        className={`flex items-center justify-center gap-3 py-4 rounded-xl border-2 font-medium transition-all ${deliveryMethod === "delivery" ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"}`}
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
                            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                          />
                        </svg>
                        Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod("pickup")}
                        className={`flex items-center justify-center gap-3 py-4 rounded-xl border-2 font-medium transition-all ${deliveryMethod === "pickup" ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"}`}
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        Pick up
                      </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <Input
                          label="First name *"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          required
                        />
                        <Input
                          label="Last name *"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          required
                        />
                      </div>
                      <Input
                        label="Email address *"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                      />
                      <Input
                        label="Phone number *"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        required
                      />

                      {deliveryMethod === "delivery" && (
                        <div className="space-y-6">
                          <Input
                            label="Country *"
                            value={formData.country}
                            onChange={(e) =>
                              handleInputChange("country", e.target.value)
                            }
                            required
                          />
                          <div className="grid grid-cols-2 gap-6">
                            <Input
                              label="City *"
                              value={formData.city}
                              onChange={(e) =>
                                handleInputChange("city", e.target.value)
                              }
                              required
                            />
                            <Input
                              label="ZIP Code *"
                              value={formData.postalCode}
                              onChange={(e) =>
                                handleInputChange("postalCode", e.target.value)
                              }
                              required
                            />
                          </div>
                          <Input
                            label="Street Address *"
                            value={formData.address}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                            required
                          />
                        </div>
                      )}
                    </div>

                    {/* Payment Method Selection - Premium UI */}
                    <div className="pt-6 border-t border-[var(--color-border)]">
                      <h3 className="text-lg font-bold mb-2">
                        Select Payment Method
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)] mb-5">
                        Choose your preferred payment option
                      </p>
                      <div className="space-y-4">
                        <PaymentMethodCard
                          id="stripe"
                          selected={paymentMethod === "stripe"}
                          onSelect={() => setPaymentMethod("stripe")}
                          accentColor="#635BFF"
                          title="Credit / Debit Card"
                          description="Pay securely with Visa, Mastercard, or American Express via Stripe"
                          icon={
                            <svg
                              className="w-7 h-7"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                          }
                        />
                        <PaymentMethodCard
                          id="payway"
                          selected={paymentMethod === "payway"}
                          onSelect={() => setPaymentMethod("payway")}
                          accentColor="#E21937"
                          title="ABA PayWay"
                          description="Pay with ABA Mobile, KHQR, or local bank cards via ABA PayWay"
                          icon={
                            <svg
                              className="w-7 h-7"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          }
                        />
                      </div>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Complete Payment</h2>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                    >
                      ← Back to Shipping
                    </button>
                  </div>

                  {createdOrderId && (
                    <div className="bg-[var(--color-bg-elevated)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
                      {paymentMethod === "stripe" && stripeClientSecret && (
                        <Elements
                          stripe={stripePromise}
                          options={{
                            clientSecret: stripeClientSecret,
                            appearance: { theme: "stripe" },
                          }}
                        >
                          <StripeForm
                            clientSecret={stripeClientSecret}
                            onSuccess={handlePaymentSuccess}
                            onError={setPaymentError}
                          />
                        </Elements>
                      )}

                      {paymentMethod === "payway" && paywayData && (
                        <div className="flex flex-col items-center justify-center p-4">
                          <div className="mb-4 text-center">
                            <img
                              src="https://checkout.payway.com.kh/images/aba-payway-logo.svg"
                              alt="ABA PayWay"
                              className="h-8 mx-auto mb-2"
                            />
                            <p className="text-[var(--color-text-muted)] text-sm">
                              Scan with ABA Mobile or any KHQR Bank app
                            </p>
                          </div>

                          <div className="bg-white p-4 rounded-3xl shadow-md border-2 border-red-500/20 mb-6 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <img
                              src={paywayData.qrImage}
                              alt="Payment QR Code"
                              className="w-64 h-64 object-contain relative z-10 mix-blend-multiply"
                            />
                          </div>

                          {paywayData.deeplink && (
                            <div className="flex flex-col items-center w-full max-w-sm gap-3">
                              <span className="text-xs text-[var(--color-text-muted)] font-medium tracking-wider uppercase">
                                Or pay directly on mobile
                              </span>
                              <a
                                href={paywayData.deeplink}
                                className="w-full flex justify-center items-center gap-2 bg-[#E21937] hover:bg-[#C1152F] text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
                              >
                                <svg
                                  className="w-6 h-6"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M17,1H7A2,2,0,0,0,5,3V21a2,2,0,0,0,2,2H17a2,2,0,0,0,2-2V3A2,2,0,0,0,17,1ZM12,21a1,1,0,1,1,1-1A1,1,0,0,1,12,21ZM17,18H7V4H17Z" />
                                </svg>
                                Pay with ABA Mobile
                              </a>
                            </div>
                          )}

                          <div className="mt-8 flex flex-col items-center justify-center gap-3 w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm font-medium text-[var(--color-text-muted)]">
                                Waiting for you to scan...
                              </span>
                            </div>

                            <button
                              onClick={async () => {
                                try {
                                  await api.post("/payment/payway/simulate", {
                                    order_id: createdOrderId,
                                  });
                                } catch (e) {
                                  console.error("Simulation failed", e);
                                }
                              }}
                              className="mt-4 text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-primary)] underline decoration-dashed transition-colors"
                            >
                              [ Simulate Payment (Dev Mode) ]
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-[var(--color-bg-elevated)]/50 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-[var(--color-border)]/50 sticky top-32">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-gray-200 p-2 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1 text-sm">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="font-semibold text-sm">${item.price}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pb-6 border-b border-[var(--color-border)] mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">
                    Subtotal
                  </span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">
                    Shipping
                  </span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">
                      Tax (10%)
                    </span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment method badge */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[var(--color-bg-surface)] rounded-lg">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      paymentMethod === "stripe" ? "#635BFF" : "#E21937",
                  }}
                />
                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                  Paying with{" "}
                  {paymentMethod === "stripe"
                    ? "Credit/Debit Card (Stripe)"
                    : "ABA PayWay"}
                </span>
              </div>

              {currentStep === 1 && (
                <Button
                  onClick={() =>
                    document
                      .getElementById("checkout-form")
                      ?.dispatchEvent(
                        new Event("submit", {
                          cancelable: true,
                          bubbles: true,
                        }),
                      )
                  }
                  size="lg"
                  fullWidth
                  isLoading={isCreatingOrder}
                  disabled={!isAuthenticated}
                  className="py-4 text-base rounded-xl mb-6 bg-[var(--color-primary)] text-white border-none shadow-lg shadow-blue-500/20"
                >
                  {paymentMethod === "stripe"
                    ? "Proceed to Payment"
                    : "Pay with ABA PayWay"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* (No Hidden Form Needed Since we natively render the QR Code now!) */}
    </motion.div>
  );
};

export default CheckoutPage;
