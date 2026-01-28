import { useState } from 'react';
import { CreditCard, Banknote, Smartphone, X } from 'lucide-react';

interface PaymentModalProps {
  total: number;
  onComplete: (paymentMethod: string) => void;
  onCancel: () => void;
}

export function PaymentModal({ total, onComplete, onCancel }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [cashAmount, setCashAmount] = useState<string>('');

  const paymentMethods = [
    { id: 'card', name: 'Card', icon: CreditCard },
    { id: 'cash', name: 'Cash', icon: Banknote },
    { id: 'mobile', name: 'Mobile Pay', icon: Smartphone },
  ];

  const handleComplete = () => {
    if (selectedMethod) {
      onComplete(selectedMethod);
    }
  };

  const cashAmountNum = parseFloat(cashAmount) || 0;
  const change = cashAmountNum - total;

  const quickCashAmounts = [20, 50, 100];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Total */}
          <div className="bg-amber-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-gray-900">
              ${total.toFixed(2)}
            </p>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Select Payment Method
            </p>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === method.id
                        ? 'border-amber-600 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mx-auto mb-2 ${
                        selectedMethod === method.id
                          ? 'text-amber-600'
                          : 'text-gray-600'
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        selectedMethod === method.id
                          ? 'text-amber-900'
                          : 'text-gray-700'
                      }`}
                    >
                      {method.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Input */}
          {selectedMethod === 'cash' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cash Received
              </label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                step="0.01"
              />
              <div className="flex gap-2 mt-2">
                {quickCashAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCashAmount(amount.toString())}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              {cashAmountNum >= total && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    Change: <span className="font-bold">${change.toFixed(2)}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Complete Button */}
          <button
            onClick={handleComplete}
            disabled={
              !selectedMethod ||
              (selectedMethod === 'cash' && cashAmountNum < total)
            }
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );
}
