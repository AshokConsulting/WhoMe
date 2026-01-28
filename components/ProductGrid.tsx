import { useState, useEffect } from 'react';
import { Coffee, Croissant, IceCream } from 'lucide-react';
import { Product, getAllProducts, seedDefaultProducts } from '@/lib/productService';

export type { Product };

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      await seedDefaultProducts();
      const productsData = await getAllProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const allCategories = ['all', 'coffee', 'pastry', 'other', ...Array.from(new Set(products.map(p => p.category).filter(c => !['coffee', 'pastry', 'other'].includes(c))))];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex gap-2 flex-wrap">
        {allCategories.map((cat) => {
          const Icon = cat === 'coffee' ? Coffee : cat === 'pastry' ? Croissant : IceCream;
          const displayName = cat === 'all' ? 'All' 
            : cat === 'coffee' ? 'Coffee'
            : cat === 'pastry' ? 'Pastries'
            : cat === 'other' ? 'Other'
            : cat.charAt(0).toUpperCase() + cat.slice(1);
          
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-5 h-5 inline mr-2" />
              {displayName}
            </button>
          );
        })}
      </div>

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
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
            <p className="text-amber-600 font-bold">${product.price.toFixed(2)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
