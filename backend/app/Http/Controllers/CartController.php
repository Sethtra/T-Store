<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Get the authenticated user's cart.
     */
    public function index()
    {
        $user = Auth::user();
        $cart = $user->cart()->with('items.product')->firstOrCreate([]);

        return response()->json([
            'cart' => $this->formatCartResponse($cart)
        ]);
    }

    /**
     * Sync the frontend guest cart with the backend user cart.
     * Overwrites matching items or adds new ones.
     */
    public function sync(Request $request)
    {
        $request->validate([
            'items' => 'array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.attributes' => 'nullable|array',
        ]);

        $user = Auth::user();
        $cart = $user->cart()->firstOrCreate([]);

        foreach ($request->items as $itemData) {
            $this->addOrUpdateItem($cart, $itemData['product_id'], $itemData['quantity'], $itemData['attributes'] ?? null);
        }

        // Return the newly merged cart
        return response()->json([
            'message' => 'Cart synchronized successfully',
            'cart' => $this->formatCartResponse($cart->load('items.product')),
        ]);
    }

    /**
     * Add a single item to the backend cart.
     */
    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'attributes' => 'nullable|array',
        ]);

        $user = Auth::user();
        $cart = $user->cart()->firstOrCreate([]);

        $this->addOrUpdateItem($cart, $request->product_id, $request->quantity, $request->attributes);

        return response()->json([
            'message' => 'Item added to cart',
            'cart' => $this->formatCartResponse($cart->load('items.product')),
        ]);
    }

    /**
     * Update the quantity of a specific cart item.
     */
    public function updateQuantity(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $user = Auth::user();
        $cart = $user->cart;

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $cartItem = $cart->items()->where('id', $itemId)->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Item not found in cart'], 404);
        }

        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json([
            'message' => 'Quantity updated',
            'cart' => $this->formatCartResponse($cart->load('items.product'))
        ]);
    }

    /**
     * Remove an item from the cart.
     */
    public function removeItem($itemId)
    {
        $user = Auth::user();
        $cart = $user->cart;

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $cart->items()->where('id', $itemId)->delete();

        return response()->json([
            'message' => 'Item removed from cart',
            'cart' => $this->formatCartResponse($cart->load('items.product'))
        ]);
    }

    /**
     * Clear the entire cart.
     */
    public function clear()
    {
        $user = Auth::user();
        if ($user->cart) {
            $user->cart->items()->delete();
        }

        return response()->json(['message' => 'Cart cleared']);
    }

    /**
     * Helper to find or create a matching item within the cart.
     */
    private function addOrUpdateItem(Cart $cart, $productId, $quantity, $attributes = null)
    {
        // Try to find an existing item with the exact same product ID and attributes
        $query = $cart->items()->where('product_id', $productId);
        
        $items = $query->get();
        
        $matchedItem = null;
        foreach ($items as $item) {
            if ($this->attributesMatch($item->attributes, $attributes)) {
                $matchedItem = $item;
                break;
            }
        }

        if ($matchedItem) {
            $matchedItem->increment('quantity', $quantity);
        } else {
            $cart->items()->create([
                'product_id' => $productId,
                'quantity' => $quantity,
                'attributes' => $attributes,
            ]);
        }
    }

    /**
     * Helper to check if two JSON arrays match logically (regardless of key order).
     */
    private function attributesMatch($attr1, $attr2)
    {
        $arr1 = is_array($attr1) ? $attr1 : [];
        $arr2 = is_array($attr2) ? $attr2 : [];

        if (count($arr1) !== count($arr2)) {
            return false;
        }

        foreach ($arr1 as $key => $val) {
            if (!array_key_exists($key, $arr2) || $arr2[$key] !== $val) {
                return false;
            }
        }

        return true;
    }

    /**
     * Formats the DB cart into the exact data structure the frontend Zustand expects.
     */
    private function formatCartResponse(Cart $cart)
    {
        return $cart->items->map(function ($item) {
             // Some defensive checks in case the product was deleted
            $product = $item->product;
            if (!$product) {
                return null;
            }

            return [
                'cart_item_id' => $item->id, // Backend exact ID
                'id' => $product->id,        // The frontend uses product.id as item.id
                'slug' => $product->slug,
                'title' => $product->title,  // The Product model uses 'title', not 'name'
                'price' => $product->price,
                'image' => !empty($product->images) && is_array($product->images) ? $product->images[0] : '',
                'quantity' => $item->quantity,
                'attributes' => $item->attributes,
            ];
        })->filter()->values();
    }
}
