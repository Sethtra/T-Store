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

// Animated Form Section Component
const FormSection = ({
  title,
  icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-card rounded-2xl p-6 md:p-8 hover-lift"
  >
    <div className="flex items-center gap-3 mb-6">
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
        className="p-3 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[#8b5cf6] text-white"
      >
        {icon}
      </motion.div>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    {children}
  </motion.div>
);

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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

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
          className="px-4 py-2 bg-[var(--color-bg-elevated)] rounded-full border border-[var(--color-border)] mb-8"
        >
          <span className="text-[var(--color-text-muted)]">Order ID: </span>
          <span className="font-mono font-bold text-[var(--color-primary)]">
            #{orderId}
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
        })),
        payment_method: "stripe" as const,
      };

      const result = await createOrder.mutateAsync(orderData);
      setOrderId(result.order.id);
      clearCart();
      setOrderSuccess(true);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = totalPrice();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-8 md:py-12"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Checkout</h1>
        <p className="text-[var(--color-text-muted)]">
          Complete your order in just a few steps
        </p>
      </motion.div>

      {/* Step Progress */}
      <StepProgress currentStep={currentStep} />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <FormSection
              title="Contact Information"
              delay={0.1}
              icon={
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <motion.div whileFocus={{ scale: 1.01 }}>
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    required
                    className="focus-glow"
                  />
                </motion.div>
                <motion.div whileFocus={{ scale: 1.01 }}>
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    required
                    className="focus-glow"
                  />
                </motion.div>
              </div>
              <div className="mt-4">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="focus-glow"
                />
              </div>
            </FormSection>

            {/* Shipping Address */}
            <FormSection
              title="Shipping Address"
              delay={0.2}
              icon={
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
            >
              <Input
                label="Street Address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
                className="focus-glow"
              />
              <div className="grid sm:grid-cols-3 gap-4 mt-4">
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                  className="focus-glow"
                />
                <Input
                  label="Postal Code"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
                  required
                  className="focus-glow"
                />
                <Input
                  label="Country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  required
                  className="focus-glow"
                />
              </div>
            </FormSection>

            {/* Payment Method */}
            <FormSection
              title="Payment Method"
              delay={0.3}
              icon={
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              }
            >
              <motion.label
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex items-center gap-4 p-5 bg-[var(--color-bg-elevated)] rounded-xl border-2 border-[var(--color-primary)] cursor-pointer transition-all"
              >
                <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-primary)] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Credit/Debit Card</span>
                    <span className="px-2 py-0.5 text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full">
                      Demo
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Secure payment powered by Stripe
                  </p>
                </div>
                <div className="flex gap-2">
                  {["💳", "🔒"].map((emoji, i) => (
                    <motion.span
                      key={i}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                      className="text-xl"
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </div>
              </motion.label>
              <p className="text-sm text-[var(--color-text-muted)] mt-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-[var(--color-success)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                This is a demo checkout. No actual payment will be processed.
              </p>
            </FormSection>

            {/* Auth Warning */}
            <AnimatePresence>
              {!isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-2xl"
                    >
                      ⚠️
                    </motion.div>
                    <p className="text-amber-400">
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

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                disabled={!isAuthenticated}
                className="py-4 text-lg font-semibold shimmer-effect"
              >
                {isSubmitting ? (
                  "Processing..."
                ) : (
                  <>
                    Place Order
                    <span className="ml-2 px-3 py-1 bg-white/20 rounded-lg">
                      ${total.toFixed(2)}
                    </span>
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="sticky top-24"
          >
            <div className="glass-premium rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto custom-scrollbar">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex gap-4 p-3 rounded-xl bg-[var(--color-bg-elevated)]/50 border border-[var(--color-border)]/50 transition-all"
                  >
                    <div className="w-16 h-16 bg-[var(--color-bg-surface)] rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {item.title}
                      </h4>
                      <p className="text-[var(--color-text-muted)] text-sm">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-[var(--color-primary)] font-semibold">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-[var(--color-border)]/50 pt-6 space-y-3">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-between text-sm"
                >
                  <span className="text-[var(--color-text-muted)]">
                    Subtotal
                  </span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  className="flex justify-between text-sm"
                >
                  <span className="text-[var(--color-text-muted)]">
                    Shipping
                  </span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-[var(--color-success)]">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-between text-sm"
                >
                  <span className="text-[var(--color-text-muted)]">
                    Tax (10%)
                  </span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.65 }}
                  className="flex justify-between font-bold text-xl pt-4 border-t border-[var(--color-border)]/50"
                >
                  <span>Total</span>
                  <motion.span
                    className="gradient-text"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ${total.toFixed(2)}
                  </motion.span>
                </motion.div>
              </div>

              {/* Free Shipping Progress */}
              {subtotal < 50 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 p-4 bg-[var(--color-primary)]/10 rounded-xl border border-[var(--color-primary)]/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--color-text-muted)]">
                      Free shipping progress
                    </span>
                    <span className="text-sm font-medium text-[var(--color-primary)]">
                      ${(50 - subtotal).toFixed(2)} away
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--color-bg-surface)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(subtotal / 50) * 100}%` }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[#8b5cf6] rounded-full"
                    />
                  </div>
                </motion.div>
              )}

              {/* Security Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]"
              >
                <svg
                  className="w-5 h-5 text-[var(--color-success)]"
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
                Secure SSL Checkout
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
