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
import { useTranslation } from "react-i18next";

import api from "../lib/api";

// Initialize Stripe outside component
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder",
);

// Step Progress Component
const StepProgress = ({ currentStep }: { currentStep: number }) => {
  const { t } = useTranslation();
  const steps = [
    { number: 1, label: t("checkout.step_shipping") },
    { number: 2, label: t("checkout.step_payment") },
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
    className={`w-full flex items-center p-4 rounded-[1.25rem] border-[1.5px] transition-all duration-300 ${
      selected
        ? `border-[${accentColor}] bg-[${accentColor}]/[0.08]`
        : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
    }`}
    style={selected ? {
      borderColor: accentColor,
      backgroundColor: `${accentColor}1A`,
    } : {}}
  >
    <div
      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 mr-4"
      style={{
        background: selected ? accentColor : `${accentColor}20`,
        color: selected ? "white" : accentColor,
      }}
    >
      <div className="text-[1.75rem]">
        {icon}
      </div>
    </div>
    
    <div className="flex-1 text-left">
      <h4
        className="font-bold text-sm tracking-wide mb-1"
        style={selected ? { color: accentColor } : { color: 'var(--color-text-primary)' }}
      >
        {title}
      </h4>
      <p className="text-[13px] text-[var(--color-text-muted)] line-clamp-1">
        {description}
      </p>
    </div>

    <div
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-4 flex-shrink-0 transition-colors ${
        selected ? 'border-[var(--color-bg-primary)] ring-2 ring-[var(--color-primary)]' : 'border-[var(--color-border)]'
      }`}
      style={selected ? { backgroundColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}` } : {}}
    >
      {selected && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  </button>
);

const PaywayQRView = ({
  paywayData,
  totalAmount,
  qrTimeLeft,
  formatTime,
  createdOrderId,
}: {
  paywayData: any;
  totalAmount: number;
  qrTimeLeft: number;
  formatTime: (t: number) => string;
  createdOrderId: number | null;
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-6 w-full">
    <div className="bg-[var(--color-bg-elevated)] backdrop-blur-3xl border border-[var(--color-border)] rounded-[2rem] shadow-2xl overflow-hidden max-w-[26rem] w-full mx-auto relative group">
       {/* Cut-out Red Ticket Header */}
       <div className="bg-[#e21937] pt-5 pb-4 flex flex-col items-center justify-center relative z-10 w-full rounded-t-[2rem]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 65%, 92% 100%, 0 100%)' }}>
          <div className="h-6 flex items-center justify-center mb-1 drop-shadow-sm">
             <span className="text-white font-[900] text-[1.4rem] tracking-[0.35em] font-sans ml-[0.35em]">KHQR</span>
          </div>
       </div>

       {/* Background Glow */}
       <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 via-transparent to-transparent opacity-50 pointer-events-none" />
       
       <div className="pt-6 px-8 pb-2 text-center relative z-10">
         <h3 className="text-2xl font-black mb-2 text-[var(--color-text-primary)]">{t("checkout.scan_to_pay")}</h3>
         <p className="text-[var(--color-text-muted)] text-[15px] max-w-[16rem] mx-auto mb-6 leading-relaxed">
           {t("checkout.pay_safe_desc")}
         </p>
         
         <div className="inline-flex flex-col items-center bg-[var(--color-bg-surface)] px-8 py-4 rounded-[1.5rem] mb-6 shadow-sm border border-[var(--color-border)]/50">
           <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-text-muted)] mb-1">{t("checkout.order_total")}</span>
           <span className="text-[2rem] font-black text-[var(--color-primary)] tracking-tight leading-none">${Number(totalAmount).toFixed(2)}</span>
         </div>
       </div>

       <div className="px-8 pb-10 flex flex-col items-center relative z-10">
         {/* QR Code Container */}
         <div className="bg-white p-5 rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.06)] border border-gray-100 flex items-center justify-center w-[17rem] h-[17rem] relative mb-8 group-hover:scale-[1.02] transition-transform duration-500">
            <img 
               src={paywayData.qrImage} 
               alt="Payment QR" 
               className="w-full h-full object-contain mix-blend-multiply opacity-90 scale-110"
               style={{ imageRendering: "pixelated" }}
            />
         </div>
         
         {/* Timer Component */}
         <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-mono text-xl font-bold border-2 transition-all duration-300 w-full justify-center ${qrTimeLeft < 60 ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[var(--color-border)]'}`}>
           <svg className={`w-5 h-5 ${qrTimeLeft < 60 ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           {formatTime(qrTimeLeft)}
         </div>

         {paywayData.deeplink && (
            <a
              href={paywayData.deeplink}
              className="mt-4 w-full flex justify-center items-center gap-2 bg-[var(--color-primary)] hover:brightness-110 !text-white px-6 py-[1.125rem] rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98] text-[15px]"
              style={{ color: 'white' }}
            >
              <svg className="w-5 h-5 !text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Pay on Phone</span>
            </a>
         )}

        <button
          onClick={async () => {
            try { await api.post("/payment/payway/simulate", { order_id: createdOrderId }); } catch (e) {}
          }}
          className="mt-6 text-[11px] font-bold tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-primary)] opacity-60 transition-colors uppercase cursor-pointer"
        >
          {'>'} Simulate Payment {'<'}
        </button>
       </div>
    </div>
  </div>
  );
};

const CheckoutPage = () => {
  const { t, i18n } = useTranslation();
  const isKh = i18n.language === "kh";
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
  const [qrTimeLeft, setQrTimeLeft] = useState<number>(300); // 5 minutes in seconds

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

  // Polling for PayWay Status and QR Timer
  useEffect(() => {
    let statusInterval: ReturnType<typeof setInterval>;
    let timerInterval: ReturnType<typeof setInterval>;

    if (currentStep === 2 && paymentMethod === "payway" && createdOrderId && !orderSuccess) {
      // Setup QR Code Timer Countdown
      timerInterval = setInterval(() => {
        setQrTimeLeft((prev) => {
          if (prev <= 1) {
             clearInterval(statusInterval);
             clearInterval(timerInterval);
             navigate("/cart");
             return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Setup Polling Status every 5 seconds
      statusInterval = setInterval(async () => {
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
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(timerInterval);
    };
  }, [currentStep, paymentMethod, createdOrderId, orderSuccess, navigate]);

  // Format QR time into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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

      // Removed clearCart() from here to allow keeping cart until successful payment!
      setQrTimeLeft(300); // Reset timer when order created

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
    clearCart(); // Clear cart only when payment succeeds
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
        <h2 className="text-2xl font-bold mb-2">{t("cart.empty")}</h2>
        <Link to="/products">
          <Button size="lg" className="mt-4">
            {t("cart.continue_shopping")}
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
        <h2 className="text-3xl font-bold mb-3">{t("checkout.success_title")}</h2>
        <p className="text-[var(--color-text-muted)] mb-8">
          {t("checkout.success_desc")}
        </p>
        <div className="flex gap-4">
          <Link to="/orders">
            <Button variant="outline" size="lg">
              {t("checkout.view_orders")}
            </Button>
          </Link>
          <Link to="/products">
            <Button size="lg">{t("cart.continue_shopping")}</Button>
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
                <PaywayQRView 
                   paywayData={paywayData}
                   totalAmount={Number(retryOrder?.total || 0)}
                   qrTimeLeft={qrTimeLeft}
                   formatTime={formatTime}
                   createdOrderId={createdOrderId}
                />
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
          <h1 className="text-3xl font-bold">{t("checkout.title")}</h1>
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
                    {t("checkout.step_shipping")} & {t("checkout.step_payment")}
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
                        {t("checkout.delivery")}
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
                        {t("checkout.pickup")}
                      </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <Input
                          label={t("auth.full_name") + " *"}
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
                        label={t("auth.email") + " *"}
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                      />
                      <Input
                        label="Phone *"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        required
                      />

                      {deliveryMethod === "delivery" && (
                        <div className="space-y-6">
                          <Input
                            label={t("checkout.shipping_address") + " *"}
                            value={formData.address}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                            required
                          />
                          <div className="grid grid-cols-2 gap-6">
                            <Input
                              label={isKh ? "ទីក្រុង / ខេត្ត *" : "City / Province *"}
                              value={formData.city}
                              onChange={(e) =>
                                handleInputChange("city", e.target.value)
                              }
                              required
                            />
                            <Input
                              label={isKh ? "លេខកូដប្រៃសណីយ៍ *" : "ZIP Code *"}
                              value={formData.postalCode}
                              onChange={(e) =>
                                handleInputChange("postalCode", e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Method Selection - Premium UI */}
                    <div className="pt-6 border-t border-[var(--color-border)]">
                      <h3 className="text-lg font-bold mb-2">
                        {t("checkout.step_payment")}
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)] mb-5">
                        {isKh ? "ជ្រើសរើសវិធីសាស្ត្រទូទាត់ប្រាក់ដែលអ្នកចង់បាន" : "Choose your preferred payment option"}
                      </p>
                      <div className="space-y-4">
                        <PaymentMethodCard
                          id="stripe"
                          selected={paymentMethod === "stripe"}
                          onSelect={() => setPaymentMethod("stripe")}
                          accentColor="#635BFF"
                          title={isKh ? "កាតឥណទាន / ឥណពន្ធ" : "Credit / Debit Card"}
                          description={isKh ? "ទូទាត់ដោយសុវត្ថិភាពជាមួយ Visa, Mastercard តាមរយៈ Stripe" : "Pay securely with Visa, Mastercard, or American Express via Stripe"}
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
                          description={isKh ? "ទូទាត់ជាមួយ ABA Mobile, KHQR ឬកាតធនាគារក្នុងស្រុក" : "Pay with ABA Mobile, KHQR, or local bank cards via ABA PayWay"}
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
                    <h2 className="text-xl font-bold">{t("checkout.step_payment")}</h2>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                    >
                      ← {isKh ? "ត្រឡប់ទៅការដឹកជញ្ជូន" : "Back to Shipping"}
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
                        <PaywayQRView 
                          paywayData={paywayData}
                          totalAmount={total}
                          qrTimeLeft={qrTimeLeft}
                          formatTime={formatTime}
                          createdOrderId={createdOrderId}
                        />
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
              <h2 className="text-xl font-bold mb-6">{t("checkout.summary")}</h2>

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
                      <h4 className="font-bold line-clamp-1 text-sm text-[var(--color-text-primary)]">
                        {item.title}
                      </h4>
                      {item.attributes && Object.keys(item.attributes).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 mb-1">
                          {Object.entries(item.attributes).map(([key, value]) => (
                            <span key={key} className="text-[10px] bg-[var(--color-bg-surface)] px-2 py-0.5 rounded-md font-medium text-[var(--color-text-muted)]">
                              {value}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-[11px] font-semibold tracking-wide text-[var(--color-text-muted)] uppercase mt-1">
                        {isKh ? "ចំនួន" : "Qty"}: {item.quantity}
                      </p>
                    </div>
                    <div className="font-semibold text-sm">${item.price}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pb-6 border-b border-[var(--color-border)] mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">
                    {t("cart.subtotal")}
                  </span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">
                    {t("checkout.delivery")}
                  </span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">
                      {t("checkout.tax")}
                    </span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>{t("checkout.total")}</span>
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
                  {isKh ? "ទូទាត់ជាមួយ" : "Paying with"}{" "}
                  {paymentMethod === "stripe"
                    ? isKh ? "កាតឥណទាន / ឥណពន្ធ (Stripe)" : "Credit/Debit Card (Stripe)"
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
                  className="py-4 text-base rounded-xl mb-24 md:mb-6 bg-[var(--color-primary)] text-white border-none shadow-lg shadow-blue-500/20"
                >
                  {paymentMethod === "stripe"
                    ? isKh ? "បន្តទៅការទូទាត់" : "Proceed to Payment"
                    : t("checkout.simulate_payment")}
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
