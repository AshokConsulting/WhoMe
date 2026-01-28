'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Product, getAllProducts, createProduct, updateProduct, deleteProduct, seedDefaultProducts } from '@/lib/productService';

interface ManageProduct extends Product {
  isEditing?: boolean;
}

export default function ManagePage() {
  const [products, setProducts] = useState<ManageProduct[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'coffee' | 'pastry' | 'other'>('all');
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'coffee',
    description: '',
    image: '',
  });
  const [customCategory, setCustomCategory] = useState('');
  const [editingCustomCategory, setEditingCustomCategory] = useState<{[key: string]: string}>({});

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
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.description || !formData.image) {
      alert('Please fill in all fields');
      return;
    }

    const finalCategory = formData.category === 'other' && customCategory.trim() 
      ? customCategory.trim() 
      : formData.category;

    if (!finalCategory) {
      alert('Please specify a category');
      return;
    }

    try {
      await createProduct({
        name: formData.name,
        price: formData.price,
        category: finalCategory,
        description: formData.description,
        image: formData.image,
      });

      await loadProducts();
      setShowAddForm(false);
      setFormData({
        name: '',
        price: 0,
        category: 'coffee',
        description: '',
        image: '',
      });
      setCustomCategory('');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const handleEditProduct = (id: string) => {
    const updatedProducts = products.map(p => 
      p.id === id ? { ...p, isEditing: true } : { ...p, isEditing: false }
    );
    setProducts(updatedProducts);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;

      const finalCategory = product.category === 'other' && editingCustomCategory[id]?.trim()
        ? editingCustomCategory[id].trim()
        : product.category;

      await updateProduct(id, {
        name: product.name,
        price: product.price,
        category: finalCategory,
        description: product.description,
        image: product.image,
      });

      const updatedProducts = products.map(p => 
        p.id === id ? { ...p, isEditing: false } : p
      );
      setProducts(updatedProducts);
      setEditingCustomCategory(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const handleCancelEdit = async (id: string) => {
    await loadProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteProduct(id);
        await loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleFieldChange = (id: string, field: keyof Product, value: any) => {
    const updatedProducts = products.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    );
    setProducts(updatedProducts);
  };

  const allCategories = ['all', 'coffee', 'pastry', 'other', ...Array.from(new Set(products.map(p => p.category).filter(c => !['coffee', 'pastry', 'other'].includes(c))))];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Manage Coffee Shop Items</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Item
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="mb-6 flex gap-2 flex-wrap">
          {allCategories.map((cat) => {
            const count = cat === 'all' 
              ? products.length 
              : products.filter(p => p.category === cat).length;
            const displayName = cat === 'all' ? 'All Items' 
              : cat === 'coffee' ? 'Coffee'
              : cat === 'pastry' ? 'Pastries'
              : cat === 'other' ? 'Other'
              : cat.charAt(0).toUpperCase() + cat.slice(1);
            
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {displayName} ({count})
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              {product.isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => handleFieldChange(product.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => handleFieldChange(product.id, 'price', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={['coffee', 'pastry', 'other'].includes(product.category) ? product.category : 'other'}
                      onChange={(e) => {
                        handleFieldChange(product.id, 'category', e.target.value);
                        if (e.target.value !== 'other') {
                          setEditingCustomCategory(prev => {
                            const newState = { ...prev };
                            delete newState[product.id];
                            return newState;
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="coffee">Coffee</option>
                      <option value="pastry">Pastry</option>
                      <option value="other">Other (Custom)</option>
                    </select>
                    {(product.category === 'other' || !['coffee', 'pastry'].includes(product.category)) && (
                      <input
                        type="text"
                        value={editingCustomCategory[product.id] || (!['coffee', 'pastry', 'other'].includes(product.category) ? product.category : '')}
                        onChange={(e) => setEditingCustomCategory(prev => ({ ...prev, [product.id]: e.target.value }))}
                        placeholder="Enter custom category name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent mt-2"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={product.description}
                      onChange={(e) => handleFieldChange(product.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="text"
                      value={product.image}
                      onChange={(e) => handleFieldChange(product.id, 'image', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(product.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => handleCancelEdit(product.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{product.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-amber-600 font-bold">${product.price.toFixed(2)}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full capitalize">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add New Item</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Caramel Latte"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    if (e.target.value !== 'other') {
                      setCustomCategory('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="coffee">Coffee</option>
                  <option value="pastry">Pastry</option>
                  <option value="other">Other (Custom)</option>
                </select>
                {formData.category === 'other' && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name (e.g., Desserts, Snacks)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent mt-2"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the item"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleAddProduct}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Add Item
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
