import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { ArrowLeft, Check, CreditCard, Lock, QrCode, Smartphone, Store, Timer, Truck } from "lucide-react";
import { useCartStore } from "../stores/cartStore";
import {
  useCreateOrder,
  useCreateStripeIntent,
  useCreatePaywayTransaction,
  type Order,
} from "../hooks/useOrders";
import { useAuthStore } from "../stores/authStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StripeForm from "../components/checkout/StripeForm";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "../utils/image";
import { formatUSD } from "../utils/money";

import api from "../lib/api";
import { getApiErrorMessage } from "../lib/errors";

type PaywayData = {
  qrImage: string;
  deeplink?: string;
};

// Initialize Stripe outside component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder");

const stripeAppearance = () => {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  return {
    theme: (dark ? "night" : "stripe") as "night" | "stripe",
    variables: {
      colorPrimary: dark ? "#f4f4f2" : "#121212",
      borderRadius: "10px",
      fontFamily: '"Hanken Grotesk", system-ui, sans-serif',
    },
  };
};

const StepProgress = ({ currentStep }: { currentStep: number }) => {
  const { t } = useTranslation();
  const steps = [t("checkout.step_shipping"), t("checkout.step_payment")];

  return (
    <ol className="flex items-center gap-3 text-sm" aria-label="Checkout progress">
      {steps.map((label, index) => {
        const n = index + 1;
        const done = currentStep > n;
        const active = currentStep === n;
        return (
          <li key={label} className="flex items-center gap-3" aria-current={active ? "step" : undefined}>
            {index > 0 && <span className="h-px w-6 bg-[var(--color-border-hover)] sm:w-10" aria-hidden="true" />}
            <span className="flex items-center gap-2">
              <span
                className={`tabular grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                  done || active
                    ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : "border border-[var(--color-border-hover)] text-[var(--color-text-muted)]"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : n}
              </span>
              <span className={active || done ? "font-medium" : "text-[var(--color-text-muted)]"}>{label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
};

const ChoiceCard = ({
  selected,
  onSelect,
  icon,
  title,
  description,
  name,
  value,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description?: string;
  name: string;
  value: string;
}) => (
  <label
    className={`flex cursor-pointer items-center gap-4 rounded-[var(--radius-md)] border p-4 transition-colors ${
      selected
        ? "border-[var(--color-text-primary)] bg-[var(--color-bg-surface)] shadow-[inset_0_0_0_1px_var(--color-text-primary)]"
        : "border-[var(--color-border-hover)] hover:border-[var(--color-text-muted)]"
    }`}
  >
    <input type="radio" name={name} value={value} checked={selected} onChange={onSelect} className="sr-only" />
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block font-semibold">{title}</span>
      {description && <span className="block text-sm text-[var(--color-text-secondary)]">{description}</span>}
    </span>
    <span
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
        selected ? "border-[var(--color-text-primary)] bg-[var(--color-primary)]" : "border-[var(--color-border-hover)]"
      }`}
      aria-hidden="true"
    >
      {selected && <span className="h-2 w-2 rounded-full bg-[var(--color-on-primary)]" />}
    </span>
  </label>
);

const PaywayQRView = ({
  paywayData,
  totalAmount,
  qrTimeLeft,
  formatTime,
  createdOrderId,
}: {
  paywayData: PaywayData;
  totalAmount: number;
  qrTimeLeft: number;
  formatTime: (t: number) => string;
  createdOrderId: number | null;
}) => {
  const { t } = useTranslation();
  const [simulating, setSimulating] = useState(false);
  const expiring = qrTimeLeft < 60;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center">
      <p className="text-sm font-semibold">ABA KHQR</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em]">{t("checkout.scan_to_pay")}</h2>
      <p className="mt-2 text-[0.9375rem] text-[var(--color-text-secondary)]">{t("checkout.scan_hint")}</p>

      <div className="mt-6 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
        <img
          src={paywayData.qrImage}
          alt="KHQR payment code"
          className="mx-auto aspect-square w-full max-w-[16rem] object-contain"
          style={{ imageRendering: "pixelated" }}
        />
        <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-neutral-300 pt-4 text-neutral-900">
          <span className="text-sm text-neutral-600">{t("checkout.order_total")}</span>
          <span className="tabular text-2xl font-semibold">{formatUSD(totalAmount)}</span>
        </div>
      </div>

      <p
        className={`mt-4 inline-flex items-center gap-2 text-sm font-medium ${
          expiring ? "text-[var(--color-error)]" : "text-[var(--color-text-secondary)]"
        }`}
        aria-live={expiring ? "assertive" : "off"}
      >
        <Timer className="h-4 w-4" aria-hidden="true" />
        {t("checkout.expires_in")} <span className="tabular">{formatTime(qrTimeLeft)}</span>
      </p>

      {paywayData.deeplink && (
        <a
          href={paywayData.deeplink}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] font-semibold text-[var(--color-on-primary)] sm:hidden"
        >
          <Smartphone className="h-[18px] w-[18px]" aria-hidden="true" />
          {t("checkout.pay_on_phone")}
        </a>
      )}

      <button
        type="button"
        disabled={!createdOrderId || simulating}
        onClick={async () => {
          if (!createdOrderId) return;
          setSimulating(true);
          try {
            await api.post("/payment/payway/simulate", { order_id: createdOrderId });
          } catch (err) {
            console.error("PayWay simulation failed", err);
          } finally {
            setSimulating(false);
          }
        }}
        className="mt-6 text-xs text-[var(--color-text-muted)] underline underline-offset-4 hover:text-[var(--color-text-primary)] disabled:opacity-50"
      >
        {t("checkout.demo_simulate")}
      </button>
    </div>
  );
};

const CheckoutPage = () => {
  const { t } = useTranslation();
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
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "payway">("payway");

  // Payment Flow State
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [retryOrder, setRetryOrder] = useState<Order | null>(null);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(
    null,
  );
  const [paywayData, setPaywayData] = useState<PaywayData | null>(null);
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
        .get<Order>(`/orders/${retryOrderId}`)
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

  // Step 2: Handle Successful Payment
  const handlePaymentSuccess = useCallback(() => {
    clearCart(); // Clear cart only when payment succeeds
    setOrderSuccess(true);
  }, [clearCart]);

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
             navigate("/orders");
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
  }, [currentStep, paymentMethod, createdOrderId, orderSuccess, navigate, handlePaymentSuccess]);

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
          variant_id: item.variant_id ?? null,
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
    } catch (error) {
      setPaymentError(
        getApiErrorMessage(error, "Failed to create order. Please try again."),
      );
      console.error("Order creation failed", error);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const subtotal = totalPrice();
  const shipping = deliveryMethod === "pickup" ? 0 : subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const wrap = "max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 pt-6 md:pt-10";

  const errorBox = paymentError && (
    <div role="alert" className="rounded-[var(--radius-md)] border border-[var(--color-error)]/30 bg-[color-mix(in_srgb,var(--color-error)_8%,transparent)] px-4 py-3 text-sm text-[var(--color-error)]">
      {paymentError}
    </div>
  );

  if (items.length === 0 && !orderSuccess && !isRetryMode && !createdOrderId) {
    return (
      <div className={`${wrap} flex min-h-[60vh] flex-col items-center justify-center text-center`}>
        <h1 className="text-2xl font-semibold">{t("cart.empty")}</h1>
        <Link
          to="/products"
          className="mt-6 inline-flex h-12 items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 font-semibold text-[var(--color-on-primary)]"
        >
          {t("cart.continue_shopping")}
        </Link>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className={`${wrap} flex min-h-[60vh] flex-col items-center justify-center text-center`}>
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[var(--color-success)] rise-in">
          <Check className="h-8 w-8" strokeWidth={2.5} />
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.03em]">{t("checkout.success_title")}</h1>
        <p className="mt-2 max-w-md text-[var(--color-text-secondary)]">{t("checkout.success_desc")}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/orders"
            className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 font-semibold text-[var(--color-on-primary)]"
          >
            {t("checkout.view_orders")}
          </Link>
          <Link
            to="/products"
            className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-hover)] px-6 font-semibold"
          >
            {t("cart.continue_shopping")}
          </Link>
        </div>
      </div>
    );
  }

  const paymentChoices = (
    <div className="space-y-3" role="radiogroup" aria-label={t("checkout.payment_method")}>
      <ChoiceCard
        name="payment"
        value="payway"
        selected={paymentMethod === "payway"}
        onSelect={() => setPaymentMethod("payway")}
        icon={<QrCode className="h-5 w-5" />}
        title={t("checkout.pay_aba_title")}
        description={t("checkout.pay_aba_desc")}
      />
      <ChoiceCard
        name="payment"
        value="stripe"
        selected={paymentMethod === "stripe"}
        onSelect={() => setPaymentMethod("stripe")}
        icon={<CreditCard className="h-5 w-5" />}
        title={t("checkout.pay_card_title")}
        description={t("checkout.pay_card_desc")}
      />
    </div>
  );

  const paymentPanel = (amount: number) => (
    <>
      {paymentMethod === "stripe" && stripeClientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret, appearance: stripeAppearance() }}>
          <StripeForm clientSecret={stripeClientSecret} onSuccess={handlePaymentSuccess} onError={setPaymentError} />
        </Elements>
      )}
      {paymentMethod === "payway" && paywayData && (
        <PaywayQRView
          paywayData={paywayData}
          totalAmount={amount}
          qrTimeLeft={qrTimeLeft}
          formatTime={formatTime}
          createdOrderId={createdOrderId}
        />
      )}
    </>
  );

  // Retry Payment Mode: pick a method and pay for an existing order
  if (isRetryMode && retryOrder && !orderSuccess) {
    const handleRetryPay = async () => {
      if (!createdOrderId) return;
      setPaymentError(null);
      setIsCreatingOrder(true);

      try {
        await api.post(`/orders/${createdOrderId}/retry-payment`, {
          payment_method: paymentMethod,
        });

        if (paymentMethod === "stripe") {
          const intentRes = await createStripeIntent.mutateAsync({ order_id: createdOrderId });
          setStripeClientSecret(intentRes.client_secret);
          setCurrentStep(2);
        } else if (paymentMethod === "payway") {
          const paywayRes = await createPaywayTransaction.mutateAsync({ order_id: createdOrderId });
          if (paywayRes.payway_response?.qrImage) {
            setPaywayData({
              qrImage: paywayRes.payway_response.qrImage,
              deeplink: paywayRes.payway_response.abapay_deeplink,
            });
            setQrTimeLeft(300);
            setCurrentStep(2);
          } else {
            throw new Error(paywayRes.payway_response.status?.message || "Failed to generate QR Code");
          }
        }
      } catch (error) {
        setPaymentError(getApiErrorMessage(error, "Failed to process payment. Please try again."));
      } finally {
        setIsCreatingOrder(false);
      }
    };

    return (
      <div className={`${wrap} max-w-2xl`}>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("checkout.back_to_orders")}
        </Link>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">
            {currentStep === 2 ? t("checkout.complete_payment") : t("checkout.retry_title")}
          </h1>
          <p className="tabular text-[var(--color-text-secondary)]">
            #{retryOrder.tracking_id || retryOrder.id} · <span className="font-semibold text-[var(--color-text-primary)]">{formatUSD(retryOrder.total)}</span>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {errorBox}

          {currentStep === 2 ? (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 sm:p-8">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("checkout.change_method")}
              </button>
              {paymentPanel(Number(retryOrder?.total || 0))}
            </div>
          ) : (
            <>
              <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                <h2 className="border-b border-[var(--color-border)] px-5 py-3.5 text-sm font-semibold">{t("checkout.order_items")}</h2>
                <ul className="divide-y divide-[var(--color-border)]">
                  {retryOrder.items?.map((item) => (
                    <li key={item.id} className="flex justify-between gap-4 px-5 py-3 text-[0.9375rem]">
                      <span className="min-w-0">
                        {item.product_title} <span className="text-[var(--color-text-muted)]">× {item.quantity}</span>
                      </span>
                      <span className="tabular font-medium">{formatUSD(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="mb-3 text-base font-semibold">{t("checkout.payment_method")}</h2>
                {paymentChoices}
              </section>

              <Button size="lg" fullWidth isLoading={isCreatingOrder} onClick={handleRetryPay} className="h-12">
                <Lock className="h-4 w-4" />
                {t("checkout.continue_payment")}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  const summary = (
    <section className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-5 sm:p-6 lg:sticky lg:top-24" aria-labelledby="summary-title">
      <h2 id="summary-title" className="text-base font-semibold">
        {t("checkout.summary")}
      </h2>

      <ul className="mt-4 max-h-[40vh] space-y-4 overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={`${item.id}-${JSON.stringify(item.attributes || {})}`} className="flex gap-3">
            <div className="relative h-16 w-16 shrink-0 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)]">
              <img src={getImageUrl(item.image)} alt="" className="h-full w-full object-contain p-1.5" />
              <span className="tabular absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--color-primary)] px-1 text-[11px] font-semibold text-[var(--color-on-primary)]">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium leading-snug">{item.title}</p>
              {item.attributes && Object.keys(item.attributes).length > 0 && (
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{Object.values(item.attributes).join(" · ")}</p>
              )}
            </div>
            <p className="tabular text-sm font-medium">{formatUSD(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-2.5 border-t border-[var(--color-border-hover)] pt-5 text-[0.9375rem]">
        <div className="flex justify-between">
          <dt className="text-[var(--color-text-secondary)]">{t("cart.subtotal")}</dt>
          <dd className="tabular">{formatUSD(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--color-text-secondary)]">{t("checkout.delivery")}</dt>
          <dd className="tabular">{shipping === 0 ? t("orders.free") : formatUSD(shipping)}</dd>
        </div>
        {tax > 0 && (
          <div className="flex justify-between">
            <dt className="text-[var(--color-text-secondary)]">{t("checkout.tax")}</dt>
            <dd className="tabular">{formatUSD(tax)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between border-t border-[var(--color-border-hover)] pt-3">
          <dt className="font-semibold">{t("checkout.total")}</dt>
          <dd className="tabular text-xl font-semibold">{formatUSD(total)}</dd>
        </div>
      </dl>

      {currentStep === 1 && isAuthenticated && (
        <Button type="submit" form="checkout-form" size="lg" fullWidth isLoading={isCreatingOrder} className="mt-6 hidden h-12 lg:inline-flex">
          <Lock className="h-4 w-4" />
          {t("checkout.continue_payment")}
        </Button>
      )}
    </section>
  );

  return (
    <div className={wrap}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{t("checkout.title")}</h1>
        <StepProgress currentStep={currentStep} />
      </div>

      <div className="grid items-start gap-8 pt-8 lg:grid-cols-12 lg:gap-14">
        <div className="space-y-8 lg:col-span-7">
          {errorBox}

          {!isAuthenticated && (
            <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">{t("checkout.sign_in_title")}</h2>
                <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{t("checkout.sign_in_desc")}</p>
              </div>
              <Link
                to="/login?redirect=/checkout"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-on-primary)]"
              >
                {t("checkout.sign_in")}
              </Link>
            </div>
          )}

          {currentStep === 1 ? (
            <form id="checkout-form" onSubmit={handleCreateOrder} className="space-y-10">
              <fieldset className="space-y-3">
                <legend className="mb-3 text-lg font-semibold">{t("checkout.delivery_method")}</legend>
                <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
                  <ChoiceCard
                    name="delivery"
                    value="delivery"
                    selected={deliveryMethod === "delivery"}
                    onSelect={() => setDeliveryMethod("delivery")}
                    icon={<Truck className="h-5 w-5" />}
                    title={t("checkout.delivery")}
                  />
                  <ChoiceCard
                    name="delivery"
                    value="pickup"
                    selected={deliveryMethod === "pickup"}
                    onSelect={() => setDeliveryMethod("pickup")}
                    icon={<Store className="h-5 w-5" />}
                    title={t("checkout.pickup")}
                  />
                </div>
                {deliveryMethod === "pickup" && (
                  <p className="text-sm text-[var(--color-text-secondary)]">{t("checkout.pickup_note")}</p>
                )}
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="mb-3 text-lg font-semibold">{t("checkout.contact")}</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t("checkout.first_name")}
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                  <Input
                    label={t("checkout.last_name")}
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t("auth.email")}
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                  <Input
                    label={t("checkout.phone")}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="012 345 678"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
              </fieldset>

              {deliveryMethod === "delivery" && (
                <fieldset className="space-y-4">
                  <legend className="mb-3 text-lg font-semibold">{t("checkout.shipping_address")}</legend>
                  <Input
                    label={t("checkout.address")}
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label={t("checkout.city")}
                      autoComplete="address-level1"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                    <Input
                      label={t("checkout.postal")}
                      autoComplete="postal-code"
                      inputMode="numeric"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      required
                    />
                  </div>
                </fieldset>
              )}

              <fieldset>
                <legend className="mb-3 text-lg font-semibold">{t("checkout.payment_method")}</legend>
                {paymentChoices}
              </fieldset>

              {/* Mobile / tablet submit; desktop submits from the summary */}
              <div className="lg:hidden">
                <Button type="submit" size="lg" fullWidth isLoading={isCreatingOrder} disabled={!isAuthenticated} className="h-12">
                  <Lock className="h-4 w-4" />
                  {t("checkout.continue_payment")} · <span className="tabular">{formatUSD(total)}</span>
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 sm:p-8">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("checkout.back_to_details")}
              </button>
              {createdOrderId && paymentPanel(total)}
            </div>
          )}
        </div>

        <div className="lg:col-span-5">{summary}</div>
      </div>
    </div>
  );
};

export default CheckoutPage;
