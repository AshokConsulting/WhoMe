'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllMenuItems, MenuItem } from '@/lib/menuService';
import { getFrequentlyOrderedItems, createOrder, OrderItem } from '@/lib/orderService';
import { ShoppingCart, RotateCcw, Plus, Minus, X, User, ArrowLeft } from 'lucide-react';

interface CartItem extends MenuItem {
  quantity: number;
}

interface OrderData {
  items: CartItem[];
  total: number;
  userId: string | null;
  userName: string | null;
  isGuest: boolean;
}

export default function POSPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [frequentItems, setFrequentItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<OrderData | null>(null);

  const categories = ['All', 'Coffee', 'Pastry', 'Sandwich', 'Dessert'];

  useEffect(() => {
    loadOrderData();
    loadMenuItems();
  }, []);

  const loadOrderData = () => {
    const savedOrder = localStorage.getItem('currentOrder');
    if (savedOrder) {
      const orderData = JSON.parse(savedOrder);
      setUserData(orderData);
      setCart(orderData.items || []);
      
      if (orderData.userId && !orderData.isGuest) {
        loadFrequentItems(orderData.userId);
      }
    }
    setLoading(false);
  };

  const loadMenuItems = async () => {
    try {
      const items = await getAllMenuItems();
      setMenuItems(items.filter(item => item.available));
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const loadFrequentItems = async (userId: string) => {
    try {
      const items = await getFrequentlyOrderedItems(userId);
      setFrequentItems(items);
    } catch (error) {
      console.error('Error loading frequent items:', error);
    }
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

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      const orderData = {
        userId: userData?.userId || 'guest',
        userName: userData?.userName || 'Guest',
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
      
      // Clear cart and localStorage
      setCart([]);
      localStorage.removeItem('currentOrder');
      
      alert('Order placed successfully!');
      router.push('/menu');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  const handleBackToMenu = () => {
    // Save current cart state
    if (cart.length > 0 && userData) {
      const updatedOrderData = {
        ...userData,
        items: cart,
        total: getTotalAmount()
      };
      localStorage.setItem('currentOrder', JSON.stringify(updatedOrderData));
    }
    router.push('/menu');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-xl text-gray-600">Loading POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToMenu}
              className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedCategory === 'All' ? 'All Items' : selectedCategory}
              </h1>
              <p className="text-sm text-gray-500">
                {userData?.isGuest ? 'Guest Checkout' : `Welcome back, ${userData?.userName}!`}
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white border-b px-4 py-3">
          <div className="flex gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Frequent Orders */}
        {frequentItems.length > 0 && (
          <div className="bg-yellow-50 border-b p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                Your Favorites - Quick Re-order
              </h3>
              <button
                onClick={() => reorderItems(frequentItems)}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Re-order All
              </button>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {frequentItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const menuItem = menuItems.find(m => m.id === item.menuItemId);
                    if (menuItem) addToCart(menuItem);
                  }}
                  className="bg-white rounded-lg p-2 shadow hover:shadow-md transition-shadow"
                >
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-20 object-cover rounded mb-2" />
                  )}
                  <div className="text-xs font-semibold text-gray-900 line-clamp-2">{item.title}</div>
                  <div className="text-xs text-amber-600 font-bold">${item.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="aspect-square bg-gray-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-amber-600 font-bold text-lg">${item.price.toFixed(2)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Cart */}
      <div className="w-96 bg-white shadow-lg flex flex-col">
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Your Order
            </h2>
            <span className="bg-blue-700 px-3 py-1 rounded-full text-sm">
              {getTotalItems()} items
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Your cart is empty</p>
              <p className="text-sm">Add items from the menu</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-lg">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                    <p className="text-amber-600 font-semibold">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id!, -1)}
                      className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id!, 1)}
                      className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id!)}
                      className="ml-1 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold">Total:</span>
            <span className="text-2xl font-bold text-amber-600">${getTotalAmount().toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
