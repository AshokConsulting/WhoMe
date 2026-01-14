'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllMenuItems, MenuItem } from '@/lib/menuService';
import { getFrequentlyOrderedItems, createOrder, OrderItem } from '@/lib/orderService';
import { ShoppingCart, RotateCcw, X, Plus, Minus, User, Home as HomeIcon } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface CartItem extends MenuItem {
  quantity: number;
}

function MenuContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const userName = searchParams.get('userName');
  const isGuest = !userId;

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [frequentItems, setFrequentItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const categories = ['All', 'Burgers', 'Chicken', 'Breakfast', 'Sides', 'Beverages', 'Desserts', 'Happy Meal'];

  useEffect(() => {
    loadMenuItems();
    if (userId) {
      loadFrequentItems(userId);
    }
  }, [userId]);

  const loadMenuItems = async () => {
    try {
      const items = await getAllMenuItems();
      setMenuItems(items.filter(item => item.available));
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const loadFrequentItems = async (uid: string) => {
    try {
      const items = await getFrequentlyOrderedItems(uid);
      setFrequentItems(items);
    } catch (error) {
      console.error('Error loading frequent items:', error);
    }
  };

  const getCategoryIcon = (category: string): string => {
    const categoryItems = menuItems.filter(item => item.category === category);
    return categoryItems[0]?.imageUrl || '';
  };

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      });
      return updated.filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const reorderItems = (items: OrderItem[]) => {
    items.forEach(orderItem => {
      const menuItem = menuItems.find(m => m.id === orderItem.menuItemId);
      if (menuItem) {
        addToCart(menuItem);
      }
    });
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
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
        totalAmount: getTotalAmount(),
        status: 'completed' as const
      };
      
      await createOrder(orderData);
      setCart([]);
      setShowCart(false);
      alert('Order placed successfully! Thank you!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Sidebar - Categories - Portrait Mode Optimized */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 bg-red-600">
          <div className="text-yellow-400 text-7xl font-bold mb-3">M</div>
          <div className="text-white text-base font-semibold">McDonald's</div>
        </div>

        <Link href="/" className="p-5 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-3">
          <HomeIcon className="w-6 h-6 text-gray-600" />
          <span className="text-base font-semibold text-gray-700">Back to Home</span>
        </Link>

        {!isGuest && userName && (
          <div className="p-5 bg-yellow-50 border-b">
            <div className="flex items-center gap-3">
              <User className="w-7 h-7 text-red-600" />
              <span className="font-bold text-lg">{userName}</span>
            </div>
          </div>
        )}

        {isGuest && (
          <div className="p-5 bg-blue-50 border-b">
            <div className="flex items-center gap-3">
              <User className="w-7 h-7 text-blue-600" />
              <span className="font-bold text-lg">Guest User</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {categories.map(category => {
            const icon = category !== 'All' ? getCategoryIcon(category) : null;
            const count = category === 'All' 
              ? menuItems.length 
              : menuItems.filter(item => item.category === category).length;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full p-5 text-left border-b hover:bg-gray-50 transition-colors ${
                  selectedCategory === category ? 'bg-red-50 border-l-8 border-l-red-600' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {icon ? (
                    <img src={icon} alt={category} className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">📋</span>
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-lg">{category}</div>
                    <div className="text-sm text-gray-500">{count} items</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header - Portrait Mode Optimized */}
        <div className="bg-white shadow-sm p-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {selectedCategory === 'All' ? 'Ala-Carte / Meals' : selectedCategory}
            </h1>
            <p className="text-lg text-gray-500">Tap items to add to your order</p>
          </div>
          
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-700 flex items-center gap-3 shadow-lg"
          >
            <ShoppingCart className="w-7 h-7" />
            <span className="font-bold text-2xl">${getTotalAmount().toFixed(2)}</span>
            {cart.length > 0 && (
              <span className="absolute -top-3 -right-3 bg-yellow-400 text-red-900 w-10 h-10 rounded-full flex items-center justify-center text-base font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Frequent Orders - Portrait Mode Optimized */}
        {frequentItems.length > 0 && (
          <div className="bg-yellow-50 border-b p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <RotateCcw className="w-6 h-6 text-red-600" />
                Your Favorites - Quick Re-order
              </h3>
              <button
                onClick={() => reorderItems(frequentItems)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 flex items-center gap-2 font-semibold"
              >
                <RotateCcw className="w-5 h-5" />
                Re-order All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {frequentItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const menuItem = menuItems.find(m => m.id === item.menuItemId);
                    if (menuItem) addToCart(menuItem);
                  }}
                  className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow"
                >
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                  )}
                  <div className="text-base font-semibold text-gray-900 line-clamp-2 mb-2">{item.title}</div>
                  <div className="text-lg text-red-600 font-bold">${item.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Menu Items Grid - Portrait Mode Optimized */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-4">No items available in this category</p>
              <p className="text-sm">Please check other categories or contact admin</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden flex items-center gap-6 p-4 hover:scale-[1.02]"
                >
                  <div className="w-48 h-48 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-2xl text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-base mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-red-600 font-bold text-3xl">${item.price.toFixed(2)}</p>
                      <div className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold text-lg">
                        Add to Cart
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="bg-red-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="text-white hover:bg-red-700 p-2 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-lg">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        <p className="text-red-600 font-semibold">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id!, -1)}
                          className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id!, 1)}
                          className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id!)}
                          className="ml-2 text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-3xl font-bold text-red-600">${getTotalAmount().toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Place Order
              </button>
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
