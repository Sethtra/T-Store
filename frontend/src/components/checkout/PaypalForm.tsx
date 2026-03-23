import { useState } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useCreatePaypalOrder, useCapturePaypalOrder } from '../../hooks/useOrders';

interface PaypalFormProps {
  orderId: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PaypalForm = ({ orderId, onSuccess, onError }: PaypalFormProps) => {
  const createPaypalOrder = useCreatePaypalOrder();
  const capturePaypalOrder = useCapturePaypalOrder();
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="w-full relative">
      {isProcessing && (
        <div className="absolute inset-0 z-10 bg-[var(--color-bg-elevated)]/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div className="w-8 h-8 border-2 border-[#0070ba] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className="p-4 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)]">
        <PayPalButtons
          style={{ layout: 'vertical', shape: 'rect' }}
          createOrder={async () => {
            try {
              const res = await createPaypalOrder.mutateAsync({ order_id: orderId });
              return res.paypal_order_id;
            } catch (err: any) {
              onError(err.message || 'Could not initiate PayPal order.');
              throw err; // Stop PayPal flow
            }
          }}
          onApprove={async (data) => {
            setIsProcessing(true);
            try {
              await capturePaypalOrder.mutateAsync({
                order_id: orderId,
                paypal_order_id: data.orderID,
              });
              onSuccess();
            } catch (err: any) {
              onError(err.message || 'Payment capture failed.');
              setIsProcessing(false);
            }
          }}
          onCancel={() => {
            // User cancelled
          }}
          onError={(err) => {
            console.error('PayPal Error:', err);
            onError('PayPal popup failed to load or encountered an error.');
          }}
        />
      </div>
    </div>
  );
};

export default PaypalForm;
