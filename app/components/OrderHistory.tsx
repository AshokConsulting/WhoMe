import { Receipt, Calendar, CreditCard, Package } from 'lucide-react';
import type { Order } from '../App';

interface OrderHistoryProps {
  orders: Order[];
}

export function OrderHistory({ orders }: OrderHistoryProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'cash':
        return <Receipt className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'card':
        return 'Card';
      case 'cash':
        return 'Cash';
      case 'mobile':
        return 'Mobile Pay';
      default:
        return method;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order History</h2>
        <p className="text-gray-600">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} today
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Receipt className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-gray-900">{order.id}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(order.timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                      {getPaymentIcon(order.paymentMethod)}
                      {getPaymentLabel(order.paymentMethod)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-medium w-6">
                          {item.quantity}x
                        </span>
                        <span className="text-gray-900">{item.name}</span>
                      </div>
                      <span className="text-gray-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
