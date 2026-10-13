import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Lock } from 'lucide-react';
import Button from '../ui/Button';

interface StripeFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const StripeForm = ({ onSuccess, onError }: StripeFormProps) => {
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
      <div>
        <PaymentElement id="payment-element" />
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={isProcessing || !stripe || !elements}
        isLoading={isProcessing}
        className="h-12"
      >
        <Lock className="h-4 w-4" />
        Pay with card
      </Button>
      
      <p className="text-xs text-center text-[var(--color-text-muted)] -mt-2">
        Payments are secure and encrypted.
      </p>
    </form>
  );
};

export default StripeForm;
