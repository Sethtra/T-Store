import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Button from '../ui/Button';

interface StripeFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const StripeForm = ({ clientSecret: _clientSecret, onSuccess, onError }: StripeFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders?payment=success`,
      },
      redirect: 'if_required', // We handle success manually without full redirect
    });

    if (error) {
      onError(error.message || 'An unexpected error occurred.');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form id="stripe-payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)]">
        <PaymentElement id="payment-element" />
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={isProcessing || !stripe || !elements}
        isLoading={isProcessing}
        className="py-4 text-base rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white border-none shadow-lg shadow-indigo-500/20"
      >
        Pay with Card
      </Button>
      
      <p className="text-xs text-center text-[var(--color-text-muted)]">
        Payments are secure and encrypted.
      </p>
    </form>
  );
};

export default StripeForm;
