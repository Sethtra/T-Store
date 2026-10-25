<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;

/**
 * Service for handling order payment fulfillment.
 * Centralizes stock decrement + StockMovement creation logic
 * that was previously duplicated across PaymentController methods.
 */
class OrderFulfillmentService
{
    /**
     * Mark an order as paid and process stock changes.
     * Only processes if the order hasn't already been paid.
     *
     * @param Order $order
     * @param string $reference  Optional suffix for the stock movement reference
     * @return bool  Whether the fulfillment was processed (false if already paid)
     */
    public function fulfillPayment(Order $order, string $reference = ''): bool
    {
        if ($order->payment_status === 'paid') {
            return false;
        }

        $order->update([
            'payment_status' => 'paid',
            'status' => 'processing',
        ]);

        $this->decrementStock($order, $reference);

        return true;
    }

    /**
     * Mark an order's payment as failed.
     *
     * @param Order $order
     * @return void
     */
    public function failPayment(Order $order): void
    {
        $order->update([
            'payment_status' => 'failed',
        ]);
    }

    /**
     * Decrement product stock and record stock movements for all items in an order.
     *
     * @param Order $order
     * @param string $referenceSuffix  Optional suffix appended to the reference string
     * @return void
     */
    private function decrementStock(Order $order, string $referenceSuffix = ''): void
    {
        foreach ($order->items as $item) {
            $product = Product::find($item->product_id);

            if ($product) {
                // Memory option bought: take it from that option, then refresh the product's total
                $variant = $item->variant_id ? ProductVariant::where('product_id', $product->id)->find($item->variant_id) : null;
                if ($variant) {
                    $variant->decrement('stock', $item->quantity);
                    $product->syncFromVariants();
                } else {
                    $product->decrement('stock', $item->quantity);
                }

                $ref = 'Order #' . $order->tracking_id;
                if ($referenceSuffix) {
                    $ref .= ' ' . $referenceSuffix;
                }

                StockMovement::create([
                    'product_id' => $product->id,
                    'variant_id' => $variant?->id,
                    'quantity_change' => -$item->quantity,
                    'type' => 'sale',
                    'reference' => $ref,
                ]);
            }
        }
    }
}
