'use client';

import { useState, useEffect, useRef } from 'react';
import { recognizeFace } from '@/lib/faceRecognition';
import { getAllMenuItems, MenuItem } from '@/lib/menuService';
import { getFrequentlyOrderedItems, createOrder, OrderItem } from '@/lib/orderService';
import { Camera, ShoppingCart, RotateCcw, X, Plus, Minus, User } from 'lucide-react';

interface CartItem extends MenuItem {
  quantity: number;
}

interface RecognizedUser {
  id: string;
  name: string;
  email: string;
}

export default function POSPage() {
  const [isScanning, setIsScanning] = useState(true);
  const [recognizedUser, setRecognizedUser] = useState<RecognizedUser | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [frequentItems, setFrequentItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const categories = ['All', 'Burgers', 'Chicken', 'Breakfast', 'Sides', 'Beverages', 'Desserts', 'Happy Meal'];

  useEffect(() => {
    loadMenuItems();
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (recognizedUser) {
      loadFrequentItems(recognizedUser.id);
    }
  }, [recognizedUser]);

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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        startFaceRecognition();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startFaceRecognition = () => {
    scanIntervalRef.current = setInterval(async () => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const imageData = canvas.toDataURL('image/jpeg');
          
          try {
            const result = await recognizeFace(imageData);
            if (result) {
              setRecognizedUser({
                id: result.id,
                name: result.name,
                email: result.email
              });
              setIsScanning(false);
              stopCamera();
            }
          } catch (error) {
            console.error('Recognition error:', error);
          }
        }
      }
    }, 1000);
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
        userId: recognizedUser?.id || 'guest',
        userName: recognizedUser?.name || 'Guest',
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
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  if (isScanning) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="rounded-lg"
              style={{ width: '640px', height: '480px' }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-4 border-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="mt-8 text-white">
            <Camera className="w-12 h-12 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold mb-2">Position Your Face</h2>
            <p className="text-gray-400">Center your face in the circle for recognition</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Sidebar - Categories */}
      <div className="w-48 bg-white shadow-lg flex flex-col">
        <div className="p-4 bg-red-600">
          <div className="text-yellow-400 text-5xl font-bold mb-2">M</div>
          <div className="text-white text-xs">McDonald's</div>
        </div>

        {recognizedUser && (
          <div className="p-4 bg-yellow-50 border-b">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-sm">{recognizedUser.name}</span>
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
                className={`w-full p-4 text-left border-b hover:bg-gray-50 transition-colors ${
                  selectedCategory === category ? 'bg-red-50 border-l-4 border-l-red-600' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {icon ? (
                    <img src={icon} alt={category} className="w-10 h-10 object-cover rounded" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xl">📋</span>
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-sm">{category}</div>
                    <div className="text-xs text-gray-500">{count} items</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCategory === 'All' ? 'Ala-Carte / Meals' : selectedCategory}
            </h1>
            <p className="text-sm text-gray-500">Tap here to select by product type</p>
          </div>
          
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">${getTotalAmount().toFixed(2)}</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Frequent Orders */}
        {frequentItems.length > 0 && (
          <div className="bg-yellow-50 border-b p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-red-600" />
                Your Favorites - Quick Re-order
              </h3>
              <button
                onClick={() => reorderItems(frequentItems)}
                className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
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
                  <div className="text-xs text-red-600 font-bold">${item.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-4">
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
                  <p className="text-red-600 font-bold text-lg">${item.price.toFixed(2)}</p>
                </div>
              </button>
            ))}
          </div>
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
