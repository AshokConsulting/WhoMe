import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import type { CartItem } from '../App';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onClear: () => void;
  total: number;
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onCheckout, onClear, total }: CartProps) {
  const tax = total * 0.08;
  const finalTotal = total + tax;

  return (
    <div className="flex flex-col h-full">
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Current Order</h2>
          </div>
          {items.length > 0 && (
            <button
              onClick={onClear}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ShoppingCart className="w-16 h-16 mb-2" />
            <p>No items in cart</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-bold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Footer */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
