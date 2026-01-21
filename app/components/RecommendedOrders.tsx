import { ShoppingBag, TrendingUp, X } from 'lucide-react';
import type { CartItem } from '../App';

interface RecommendedOrder {
  items: CartItem[];
  frequency: number;
  lastOrdered: Date;
}

interface RecommendedOrdersProps {
  recommendations: RecommendedOrder[];
  onSelectOrder: (items: CartItem[]) => void;
  onClose: () => void;
}

export function RecommendedOrders({ recommendations, onSelectOrder, onClose }: RecommendedOrdersProps) {
  if (recommendations.length === 0) return null;

  const getOrderSummary = (items: CartItem[]) => {
    if (items.length === 0) return 'Empty order';
    if (items.length === 1) return items[0].name;
    if (items.length === 2) return `${items[0].name} & ${items[1].name}`;
    return `${items[0].name} & ${items.length - 1} more`;
  };

  const getOrderTotal = (items: CartItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">Your Frequent Orders</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-amber-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recommendations.map((rec, index) => (
            <button
              key={index}
              onClick={() => onSelectOrder(rec.items)}
              className="bg-white rounded-lg p-4 border-2 border-amber-200 hover:border-amber-400 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-600">
                    Ordered {rec.frequency}x
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  ${getOrderTotal(rec.items).toFixed(2)}
                </span>
              </div>
              
              <p className="text-sm font-medium text-gray-900 mb-1 group-hover:text-amber-700 transition-colors">
                {getOrderSummary(rec.items)}
              </p>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {rec.items.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full"
                  >
                    {item.quantity}x {item.name}
                  </span>
                ))}
                {rec.items.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    +{rec.items.length - 3} more
                  </span>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Last ordered: {new Date(rec.lastOrdered).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
