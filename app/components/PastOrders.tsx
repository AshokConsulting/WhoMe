import { RotateCcw, Clock, X } from 'lucide-react';
import type { Order, CartItem } from '../App';

interface PastOrdersProps {
  orders: Order[];
  onReorder: (items: CartItem[]) => void;
  onClose: () => void;
}

export function PastOrders({ orders, onReorder, onClose }: PastOrdersProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get unique orders (deduplicate same items)
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="bg-amber-50 border-b border-amber-200 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900">Your Recent Orders</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-amber-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-600">No previous orders yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg p-4 border border-amber-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(order.timestamp)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items.length} items · ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700">
                      <span className="text-gray-400 mr-2">{item.quantity}x</span>
                      <span className="truncate">{item.name}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onReorder(order.items)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Order Again
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
