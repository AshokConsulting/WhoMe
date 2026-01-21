import { useState } from 'react';
import { Coffee, Croissant, Cookie, IceCream } from 'lucide-react';
import type { Product } from '../App';

const products: Product[] = [
  { id: '1', name: 'Espresso', price: 2.50, category: 'coffee', image: 'https://images.unsplash.com/photo-1645445644664-8f44112f334c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3ByZXNzbyUyMGNvZmZlZSUyMGN1cHxlbnwxfHx8fDE3Njg4OTE3NTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '2', name: 'Cappuccino', price: 3.75, category: 'coffee', image: 'https://images.unsplash.com/photo-1708430651927-20e2e1f1e8f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXBwdWNjaW5vJTIwY29mZmVlfGVufDF8fHx8MTc2ODg4NDM3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '3', name: 'Latte', price: 4.00, category: 'coffee', image: 'https://images.unsplash.com/photo-1582152747136-af63c112fce5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGNvZmZlZXxlbnwxfHx8fDE3Njg4OTI0MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '4', name: 'Americano', price: 3.00, category: 'coffee', image: 'https://images.unsplash.com/photo-1669872484166-e11b9638b50e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWVyaWNhbm8lMjBjb2ZmZWV8ZW58MXx8fHwxNzY4ODkyNDA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '5', name: 'Mocha', price: 4.50, category: 'coffee', image: 'https://images.unsplash.com/photo-1618576230663-9714aecfb99a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2NoYSUyMGNvZmZlZXxlbnwxfHx8fDE3Njg4ODk5NTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '6', name: 'Flat White', price: 4.25, category: 'coffee', image: 'https://images.unsplash.com/photo-1727080409436-356bdc609899?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbGF0JTIwd2hpdGUlMjBjb2ZmZWV8ZW58MXx8fHwxNzY4OTYwNTg0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '7', name: 'Cold Brew', price: 4.00, category: 'coffee', image: 'https://images.unsplash.com/photo-1561641377-f7456d23aa9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xkJTIwYnJldyUyMGNvZmZlZXxlbnwxfHx8fDE3Njg5NjA1ODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '8', name: 'Macchiato', price: 3.50, category: 'coffee', image: 'https://images.unsplash.com/photo-1674642387246-463a03b100be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWNjaGlhdG8lMjBjb2ZmZWV8ZW58MXx8fHwxNzY4OTYwNTg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '9', name: 'Croissant', price: 3.50, category: 'pastry', image: 'https://images.unsplash.com/photo-1733997926055-fdb6ba24692b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGNyb2lzc2FudHxlbnwxfHx8fDE3Njg5NjA1ODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '10', name: 'Blueberry Muffin', price: 3.00, category: 'pastry', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlYmVycnklMjBtdWZmaW58ZW58MXx8fHwxNzY4ODk5MDY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '11', name: 'Chocolate Cookie', price: 2.50, category: 'pastry', image: 'https://images.unsplash.com/photo-1623659945014-d166115a8e20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjb29raWV8ZW58MXx8fHwxNzY4OTYwNTg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '12', name: 'Bagel', price: 2.75, category: 'pastry', image: 'https://images.unsplash.com/photo-1707144289499-8903dc4929c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWdlbCUyMGJyZWFrZmFzdHxlbnwxfHx8fDE3Njg5NjA1ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '13', name: 'Cinnamon Roll', price: 4.00, category: 'pastry', image: 'https://images.unsplash.com/photo-1645995575875-ea6511c9d127?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5uYW1vbiUyMHJvbGx8ZW58MXx8fHwxNzY4OTQ1NDIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '14', name: 'Banana Bread', price: 3.25, category: 'pastry', image: 'https://images.unsplash.com/photo-1569762404472-026308ba6b64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5hbmElMjBicmVhZHxlbnwxfHx8fDE3Njg5NjA1ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '15', name: 'Orange Juice', price: 3.50, category: 'other', image: 'https://images.unsplash.com/photo-1641659735894-45046caad624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmFuZ2UlMjBqdWljZSUyMGdsYXNzfGVufDF8fHx8MTc2ODk0NDAxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '16', name: 'Bottled Water', price: 1.50, category: 'other', image: 'https://images.unsplash.com/photo-1536939459926-301728717817?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3R0bGVkJTIwd2F0ZXJ8ZW58MXx8fHwxNzY4OTQzNTcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
];

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'coffee' | 'pastry' | 'other'>('all');

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'coffee':
        return <Coffee className="w-5 h-5" />;
      case 'pastry':
        return <Croissant className="w-5 h-5" />;
      default:
        return <IceCream className="w-5 h-5" />;
    }
  };

  return (
    <div>
      {/* Category Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setSelectedCategory('coffee')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            selectedCategory === 'coffee'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Coffee className="w-4 h-4" />
          Coffee
        </button>
        <button
          onClick={() => setSelectedCategory('pastry')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            selectedCategory === 'pastry'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Croissant className="w-4 h-4" />
          Pastries
        </button>
        <button
          onClick={() => setSelectedCategory('other')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            selectedCategory === 'other'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <IceCream className="w-4 h-4" />
          Other
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => onAddToCart(product)}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-amber-500 hover:shadow-lg transition-all text-left group"
          >
            <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
            <p className="text-amber-600 font-bold">${product.price.toFixed(2)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}