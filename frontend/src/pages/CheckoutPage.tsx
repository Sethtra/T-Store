import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../stores/cartStore";
import { useCreateOrder } from "../hooks/useOrders";
import { useAuthStore } from "../stores/authStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

// Step Progress Component
const StepProgress = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { number: 1, label: "Contact" },
    { number: 2, label: "Shipping" },
    { number: 3, label: "Payment" },
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
              whileHover={{ scale: 1.1 }}
            >
              {currentStep > step.number ? (
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
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
                </motion.svg>
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
                currentStep > step.number
                  ? "completed"
                  : currentStep === step.number + 1
                    ? "active"
                    : ""
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const createOrder = useCreateOrder();

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">(
    "delivery",
  );

  // Calculate step based on form completion
  const updateStep = (field: string) => {
    if (
      ["firstName", "lastName", "email"].includes(field) &&
      formData.firstName &&
      formData.lastName &&
      formData.email
    ) {
      setCurrentStep(2);
    }
    if (
      ["address", "city", "postalCode", "country"].includes(field) &&
      formData.address &&
      formData.city
    ) {
      setCurrentStep(3);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setTimeout(() => updateStep(field), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          attributes: item.attributes, // Pass attributes to backend
        })),
        payment_method: "stripe" as const,
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

      await createOrder.mutateAsync(orderData);
      clearCart();
      setOrderSuccess(true);
    } catch (error: any) {
      // alert(error.response?.data?.message || "Failed to place order");
      console.error("Order failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = totalPrice();
  const shipping = deliveryMethod === "pickup" ? 0 : subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (items.length === 0 && !orderSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[70vh] flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-[var(--color-bg-elevated)] rounded-full flex items-center justify-center mb-6 border border-[var(--color-border)]"
        >
          <svg
            className="w-12 h-12 text-[var(--color-text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mb-2"
        >
          Your cart is empty
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[var(--color-text-muted)] mb-6"
        >
          Add some products to get started
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link to="/products">
            <Button size="lg" className="shimmer-effect">
              Continue Shopping
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  if (orderSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden"
      >
        {/* Confetti Effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 1,
                y: "100vh",
                x: Math.random() * window.innerWidth,
                rotate: 0,
              }}
              animate={{
                opacity: 0,
                y: "-100vh",
                rotate: 720,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "easeOut",
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                background: [
                  "var(--color-primary)",
                  "#8b5cf6",
                  "#10b981",
                  "#f59e0b",
                  "#ef4444",
                ][i % 5],
              }}
            />
          ))}
        </div>

        {/* Success Content */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.2,
          }}
          className="relative"
        >
          {/* Ripple Effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute inset-0 rounded-full bg-[var(--color-success)]"
          />
          <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-success)] to-emerald-400 rounded-full flex items-center justify-center mb-8 shadow-lg relative z-10">
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-3xl font-bold mb-3"
        >
          Order Placed Successfully!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-[var(--color-text-muted)] mb-2"
        >
          Thank you for your purchase
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="px-4 py-2 bg-[var(--color-bg-elevated)] rounded-full border border-[var(--color-border)] mb-8 flex items-center gap-2"
        >
          <span className="text-[var(--color-text-muted)]">Order Status:</span>
          <span className="font-bold text-[var(--color-success)]">
            Confirmed
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex gap-4"
        >
          <Link to="/orders">
            <Button variant="outline" size="lg">
              View Orders
            </Button>
          </Link>
          <Link to="/products">
            <Button size="lg" className="shimmer-effect">
              Continue Shopping
            </Button>
          </Link>
        </motion.div>
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 md:mb-12"
        >
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>
          <StepProgress currentStep={currentStep} />
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Form (Span 7) */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-6">Shipping Information</h2>

              <form
                id="checkout-form"
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* Delivery Method Toggle */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("delivery")}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 font-medium transition-all ${
                      deliveryMethod === "delivery"
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)] bg-[var(--color-bg-elevated)]/50"
                    }`}
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
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                    Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("pickup")}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 font-medium transition-all ${
                      deliveryMethod === "pickup"
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)] bg-[var(--color-bg-elevated)]/50"
                    }`}
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
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
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      required
                      className="bg-transparent border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-lg px-4 py-3"
                    />
                    <Input
                      label="Last name *"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      required
                      className="bg-transparent border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-lg px-4 py-3"
                    />
                  </div>

                  <Input
                    label="Email address *"
                    placeholder="Enter email address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="bg-transparent border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-lg px-4 py-3"
                  />

                  <Input
                    label="Phone number *"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                    className="bg-transparent border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-lg px-4 py-3"
                  />

                  <AnimatePresence>
                    {deliveryMethod === "delivery" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6 overflow-hidden"
                      >
                        <Input
                          label="Country *"
                          placeholder="Choose state"
                          value={formData.country}
                          onChange={(e) =>
                            handleInputChange("country", e.target.value)
                          }
                          className="bg-transparent border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-lg px-4 py-3"
                          required={deliveryMethod === "delivery"}
                        />

                        <div className="grid grid-cols-3 gap-6">
                          <Input
                            label="City"
                            placeholder="Enter city"
                            value={formData.city}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                            required={deliveryMethod === "delivery"}
                            className="bg-transparent border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-lg px-4 py-3"
                          />
                          <Input
                            label="State"
                            placeholder="Enter state"
                            className="bg-transparent border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-lg px-4 py-3"
                          />
                          <Input
                            label="ZIP Code"
                            placeholder="Enter ZIP code"
                            value={formData.postalCode}
                            onChange={(e) =>
                              handleInputChange("postalCode", e.target.value)
                            }
                            required={deliveryMethod === "delivery"}
                            className="bg-transparent border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-lg px-4 py-3"
                          />
                        </div>

                        <Input
                          label="Street Address *"
                          placeholder="Enter street address"
                          value={formData.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          required={deliveryMethod === "delivery"}
                          className="bg-transparent border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-lg px-4 py-3"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <label className="flex items-center gap-3 cursor-pointer group mt-4">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-[var(--color-bg-elevated)]"
                      defaultChecked
                      required
                    />
                    <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                      I have read and agree to the Terms and Conditions.
                    </span>
                  </label>
                </div>
              </form>

              {/* Auth Warning */}
              <AnimatePresence>
                {!isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚠️</span>
                      <p className="text-amber-500 dark:text-amber-400">
                        Please{" "}
                        <Link
                          to="/login"
                          className="underline font-medium hover:text-amber-300"
                        >
                          login
                        </Link>{" "}
                        or{" "}
                        <Link
                          to="/register"
                          className="underline font-medium hover:text-amber-300"
                        >
                          register
                        </Link>{" "}
                        to complete your order.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Order Summary (Span 5) */}
          <div className="lg:col-span-5">
            <div className="bg-[var(--color-bg-elevated)]/50 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-[var(--color-border)]/50 sticky top-32">
              <h2 className="text-xl font-bold mb-6">Review your cart</h2>

              {/* Cart Items */}
              <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-20 bg-white rounded-xl overflow-hidden border border-gray-200 p-2 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="font-semibold">${item.price}</div>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="flex gap-3 mb-8">
                <input
                  type="text"
                  placeholder="Discount code"
                  className="flex-1 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-all"
                />
                <button className="px-6 py-3 bg-[var(--color-bg-surface)] text-[var(--color-primary)] font-medium rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-primary)] transition-all">
                  Apply
                </button>
              </div>

              {/* Totals */}
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
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">
                    Discount
                  </span>
                  <span className="font-medium text-[var(--color-success)]">
                    -$0.00
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Pay Button */}
              <Button
                onClick={() =>
                  document
                    .getElementById("checkout-form")
                    ?.dispatchEvent(
                      new Event("submit", { cancelable: true, bubbles: true }),
                    )
                }
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                disabled={!isAuthenticated}
                className="py-4 text-base rounded-xl mb-6 bg-[#3b82f6] hover:bg-[#2563eb] text-white border-none shadow-lg shadow-blue-500/20"
              >
                Pay Now
              </Button>

              {/* Secure Badge */}
              <div className="flex items-center gap-2 justify-center text-sm text-[var(--color-text-muted)]">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span className="font-medium">
                  Secure Checkout - SSL Encrypted
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] text-center mt-2 max-w-[280px] mx-auto opacity-75">
                Ensuring your financial and personal details are secure during
                every transaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
