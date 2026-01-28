'use client';

import { useState, useEffect } from 'react';
import { ProductGrid } from '@/components/ProductGrid';
import { Cart, CartItem } from '@/components/Cart';
import { OrderHistory, Order } from '@/components/OrderHistory';
import { PaymentModal } from '@/components/PaymentModal';
import { LandingScreen } from '@/components/LandingScreen';
import { PastOrders } from '@/components/PastOrders';
import { RecommendedOrders } from '@/components/RecommendedOrders';
import { User } from 'lucide-react';
import type { User as FaceUser } from '@/lib/userService';
import { Product } from '@/components/ProductGrid';
import Link from 'next/link';

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  faceImageUrl?: string;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  const [showPastOrders, setShowPastOrders] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedOrders = localStorage.getItem('orders');
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders).map((order: any) => ({
        ...order,
        timestamp: new Date(order.timestamp),
      }));
      setOrders(parsedOrders);
    }
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('orders', JSON.stringify(orders));
    }
  }, [orders]);

  const handleFaceLoginSuccess = (user: FaceUser) => {
    const userProfile: UserProfile = {
      id: user.id || '',
      name: user.name,
      email: user.email,
      phone: user.phone,
      faceImageUrl: user.faceImageUrl,
    };
    setCurrentUser(userProfile);
    localStorage.setItem('currentUser', JSON.stringify(userProfile));
    setIsAuthenticated(true);
  };

  const addToCart = (product: Product) => {
    if (!product.id) {
      console.error('Product ID is required to add to cart');
      return;
    }
    
    const productId: string = product.id; // Type assertion after null check
    
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { 
        id: productId, 
        name: product.name, 
        price: product.price, 
        category: product.category, 
        image: product.image, 
        quantity: 1 
      }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      setShowPayment(true);
    }
  };

  const completeOrder = (paymentMethod: string) => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items: [...cartItems],
      total: getTotal(),
      timestamp: new Date(),
      paymentMethod,
      userId: currentUser?.id,
    };
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setShowPayment(false);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleReorder = (items: CartItem[]) => {
    setCartItems(items);
    setShowPastOrders(false);
    setActiveTab('pos');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setCartItems([]);
    setShowPastOrders(false);
    setShowRecommendations(true);
    setShowUserDropdown(false);
    setShowPayment(false);
    setActiveTab('pos');
  };

  const userOrders = currentUser
    ? orders.filter((order) => order.userId === currentUser.id)
    : orders;

  const getRecommendedOrders = () => {
    if (!currentUser || userOrders.length === 0) return [];

    const orderMap = new Map<string, { items: CartItem[]; frequency: number; lastOrdered: Date }>();

    userOrders.forEach((order) => {
      const orderKey = order.items
        .map((item) => `${item.id}-${item.quantity}`)
        .sort()
        .join('|');

      if (orderMap.has(orderKey)) {
        const existing = orderMap.get(orderKey)!;
        existing.frequency += 1;
        if (order.timestamp > existing.lastOrdered) {
          existing.lastOrdered = order.timestamp;
        }
      } else {
        orderMap.set(orderKey, {
          items: order.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            category: 'coffee', // Default category, could be stored with order
            image: '', // Default image, could be stored with order
            quantity: item.quantity
          })),
          frequency: 1,
          lastOrdered: order.timestamp,
        });
      }
    });

    return Array.from(orderMap.values())
      .filter((rec) => rec.frequency >= 2)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3);
  };

  const recommendedOrders = getRecommendedOrders();

  const handleSelectRecommendedOrder = (items: CartItem[]) => {
    setCartItems(items);
    setShowRecommendations(false);
  };

  if (!isAuthenticated) {
    return (
      <LandingScreen
        onSuccess={handleFaceLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="FaceFlow Logo" 
                className="h-10 w-auto object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">FaceFlow Coffee</h1>
                <p className="text-xs text-gray-600">Your personalized coffee experience</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('pos')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'pos'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Order
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'history'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Order History
                </button>
                <Link href="/manage">
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                    Manage Items
                  </button>
                </Link>
                <Link href="/admin">
                  <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
                    Admin
                  </button>
                </Link>
              </div>
              {currentUser && (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500 hover:border-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  >
                    {currentUser.faceImageUrl ? (
                      <img 
                        src={currentUser.faceImageUrl} 
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-amber-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-amber-600" />
                      </div>
                    )}
                  </button>
                  {showUserDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowUserDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                          <p className="text-xs text-gray-600">{currentUser.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {currentUser && showRecommendations && recommendedOrders.length > 0 && activeTab === 'pos' && (
        <RecommendedOrders
          recommendations={recommendedOrders}
          onSelectOrder={handleSelectRecommendedOrder}
          onClose={() => setShowRecommendations(false)}
        />
      )}

      {currentUser && showPastOrders && userOrders.length > 0 && activeTab === 'pos' && (
        <PastOrders
          orders={userOrders}
          onReorder={handleReorder}
          onClose={() => setShowPastOrders(false)}
        />
      )}

      {activeTab === 'pos' ? (
        <div className="flex h-[calc(100vh-73px)]">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {currentUser?.name}! ☕
              </h2>
              <p className="text-gray-600">
                Ready for your favorite coffee? Your personalized recommendations are waiting.
              </p>
            </div>
            <ProductGrid onAddToCart={addToCart} />
          </div>

          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <Cart
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}
              onClear={clearCart}
              total={getTotal()}
            />
          </div>
        </div>
      ) : (
        <div className="p-6">
          <OrderHistory orders={currentUser ? userOrders : orders} />
        </div>
      )}

      {showPayment && (
        <PaymentModal
          total={getTotal()}
          onComplete={completeOrder}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
