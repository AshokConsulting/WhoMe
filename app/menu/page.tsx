'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllMenuItems, MenuItem } from '@/lib/menuService';
import { getFrequentlyOrderedItems, createOrder, OrderItem } from '@/lib/orderService';
import { Plus, Minus, ShoppingCart, Coffee, Cake, Sandwich, Cookie, RotateCcw, X, Check, Trash2, User, LogOut } from 'lucide-react';

interface CartItem extends MenuItem {
  quantity: number;
}

function MenuPageContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const userName = searchParams.get('userName');
  const isGuest = !userId;
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [frequentItems, setFrequentItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'coffee' | 'pastry' | 'sandwich' | 'dessert' | 'past-orders'>(
    !isGuest && userId ? 'past-orders' : 'all'
  );
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [showPastOrders, setShowPastOrders] = useState(true);

  const categories = [
    { id: 'past-orders', name: 'Reorder', icon: RotateCcw },
    { id: 'all', name: 'All Items', icon: Coffee },
    { id: 'coffee', name: 'Coffee', icon: Coffee },
    { id: 'pastry', name: 'Pastries', icon: Cake },
    { id: 'sandwich', name: 'Sandwiches', icon: Sandwich },
    { id: 'dessert', name: 'Desserts', icon: Cookie },
  ];

  useEffect(() => {
    loadMenuItems();
    loadFrequentItems();
  }, [userId]);

  const loadMenuItems = async () => {
    try {
      const items = await getAllMenuItems();
      setMenuItems(items.filter(item => item.available));
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFrequentItems = async () => {
    if (userId && !isGuest) {
      try {
        const items = await getFrequentlyOrderedItems(userId);
        setFrequentItems(items);
      } catch (error) {
        console.error('Error loading frequent items:', error);
      }
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : selectedCategory === 'past-orders'
    ? frequentItems.map(item => menuItems.find(m => m.id === item.menuItemId)).filter(Boolean) as MenuItem[]
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev =>
        prev.map(item => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const reorderItems = (items: OrderItem[]) => {
    items.forEach(orderItem => {
      const menuItem = menuItems.find(m => m.id === orderItem.menuItemId);
      if (menuItem) {
        addToCart(menuItem);
      }
    });
    setShowPastOrders(false);
  };

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getTax = () => getSubtotal() * 0.08;
  const getTotalPrice = () => getSubtotal() + getTax();

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsProcessingOrder(true);
    
    try {
      const orderData = {
        userId: userId || 'guest',
        userName: userName || 'Guest',
        items: cart.map(item => ({
          menuItemId: item.id!,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        totalAmount: getTotalPrice(),
        status: 'completed' as const
      };
      
      await createOrder(orderData);
      
      // Clear cart after successful order
      setCart([]);
      setShowCheckoutPopup(false);
            
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handleLogout = () => {
    // Navigate back to home page for face recognition
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-xl text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            </div>
            <div className="flex items-center gap-4">
             {!isGuest && userName && (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <User className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                            {userName}
                        </p>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                        </div>
                        <p className="text-xs text-gray-600">Recognized User</p>
                    </div>
                    </div>
                </div>
                )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Category Filter */}
          <div className="mb-6 flex gap-2">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category.id === 'all' ? (
                    'All Items'
                  ) : (
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {category.name}
                    </div>
                  )}
                 
                </button>
              );
            })}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-amber-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-amber-600 font-bold">${item.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="flex flex-col h-full">
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-gray-600" />
                  <h2 className="font-semibold text-gray-900">Current Order</h2>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ShoppingCart className="w-16 h-16 mb-2" />
                  <p>No items in cart</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-600">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id!)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id!, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id!, item.quantity + 1)}
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
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>${getTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => setShowCheckoutPopup(true)}
                disabled={cart.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Popup */}
      {showCheckoutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-blue-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-center">Complete Order</h2>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Order Summary</h3>
                <p className="text-gray-600 mb-4">
                  {getTotalItems()} items • Total: ${getTotalPrice().toFixed(2)}
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Order Details:</h4>
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{item.quantity}x {item.title}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t mt-3 pt-3 flex justify-between font-bold text-gray-900">
                    <span>Subtotal</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (8%)</span>
                    <span>${getTax().toFixed(2)}</span>
                  </div>
                  <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckoutPopup(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessingOrder}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessingOrder ? 'Processing...' : 'Confirm Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <MenuPageContent />
    </Suspense>
  );
}