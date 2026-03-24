import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useCartStore } from "../stores/cartStore";
import { useCreateOrder, useCreateStripeIntent } from "../hooks/useOrders";
import { useAuthStore } from "../stores/authStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StripeForm from "../components/checkout/StripeForm";
import PaypalForm from "../components/checkout/PaypalForm";

// Initialize Stripe outside component
// Use a placeholder if env var is missing to avoid crashing, but payment will fail
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || "pk_test_placeholder");

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
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const createOrder = useCreateOrder();
  const createStripeIntent = useCreateStripeIntent();

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

  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  
  // Payment Flow State
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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

      // If Stripe, we need a PaymentIntent immediately
      if (paymentMethod === "stripe") {
        const intentRes = await createStripeIntent.mutateAsync({ order_id: orderId });
        setStripeClientSecret(intentRes.client_secret);
      }

      setCurrentStep(2); // Move to payment step
    } catch (error: any) {
      setPaymentError(error.response?.data?.message || "Failed to create order. Please try again.");
      console.error("Order creation failed", error);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Step 2: Handle Successful Payment
  const handlePaymentSuccess = () => {
    clearCart();
    setOrderSuccess(true);
  };

  const subtotal = totalPrice();
  const shipping = deliveryMethod === "pickup" ? 0 : subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (items.length === 0 && !orderSuccess) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[70vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <Link to="/products">
          <Button size="lg" className="mt-4">Continue Shopping</Button>
        </Link>
      </motion.div>
    );
  }

  if (orderSuccess) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-3">Payment Successful!</h2>
        <p className="text-[var(--color-text-muted)] mb-8">Your order has been placed and is being processed.</p>
        <div className="flex gap-4">
          <Link to="/orders"><Button variant="outline" size="lg">View Orders</Button></Link>
          <Link to="/products"><Button size="lg">Continue Shopping</Button></Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12 md:pb-16" style={{ paddingTop: "140px" }}>
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
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-xl font-bold mb-6">Shipping & Payment Method</h2>
                  <form id="checkout-form" onSubmit={handleCreateOrder} className="space-y-8">
                    
                    {/* Delivery Method */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod("delivery")}
                        className={`py-4 rounded-xl border-2 font-medium transition-all ${deliveryMethod === "delivery" ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-[var(--color-border)]"}`}
                      >
                        Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod("pickup")}
                        className={`py-4 rounded-xl border-2 font-medium transition-all ${deliveryMethod === "pickup" ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-[var(--color-border)]"}`}
                      >
                        Pick up
                      </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <Input label="First name *" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} required />
                        <Input label="Last name *" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} required />
                      </div>
                      <Input label="Email address *" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} required />
                      <Input label="Phone number *" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} required />

                      {deliveryMethod === "delivery" && (
                        <div className="space-y-6">
                          <Input label="Country *" value={formData.country} onChange={(e) => handleInputChange("country", e.target.value)} required />
                          <div className="grid grid-cols-2 gap-6">
                            <Input label="City *" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} required />
                            <Input label="ZIP Code *" value={formData.postalCode} onChange={(e) => handleInputChange("postalCode", e.target.value)} required />
                          </div>
                          <Input label="Street Address *" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} required />
                        </div>
                      )}
                    </div>

                    {/* Payment Selection */}
                    <div className="pt-6 border-t border-[var(--color-border)]">
                      <h3 className="text-lg font-bold mb-4">Select Payment Method</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("stripe")}
                          className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === "stripe" ? "border-indigo-500 bg-indigo-500/5 text-indigo-500" : "border-[var(--color-border)]"}`}
                        >
                          Credit Card (Stripe)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("paypal")}
                          className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === "paypal" ? "border-[#0070ba] bg-[#0070ba]/5 text-[#0070ba]" : "border-[var(--color-border)]"}`}
                        >
                          PayPal
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
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
                        <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret, appearance: { theme: 'stripe' } }}>
                          <StripeForm 
                            clientSecret={stripeClientSecret} 
                            onSuccess={handlePaymentSuccess} 
                            onError={setPaymentError} 
                          />
                        </Elements>
                      )}
                      
                      {paymentMethod === "paypal" && (
                        <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
                          <PaypalForm 
                            orderId={createdOrderId} 
                            onSuccess={handlePaymentSuccess} 
                            onError={setPaymentError} 
                          />
                        </PayPalScriptProvider>
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
                      <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1 text-sm">{item.title}</h4>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-semibold text-sm">${item.price}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pb-6 border-b border-[var(--color-border)] mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Shipping</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {currentStep === 1 && (
                <Button
                  onClick={() => document.getElementById("checkout-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))}
                  size="lg"
                  fullWidth
                  isLoading={isCreatingOrder}
                  disabled={!isAuthenticated}
                  className="py-4 text-base rounded-xl mb-6 bg-[var(--color-primary)] text-white border-none shadow-lg shadow-blue-500/20"
                >
                  Proceed to Payment
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
