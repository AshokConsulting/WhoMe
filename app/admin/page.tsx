'use client';

import { useState, useEffect } from 'react';
import { MenuItem, getAllMenuItems, deleteMenuItem } from '@/lib/menuService';
import { Plus, Edit, Trash2, ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import MenuItemForm from '@/components/MenuItemForm';
import StorageDiagnostic from '@/components/StorageDiagnostic';

export default function AdminPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['Burgers', 'Chicken', 'Breakfast', 'Sides', 'Beverages', 'Desserts', 'Happy Meal'];

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const items = await getAllMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
      alert('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      await deleteMenuItem(id);
      await loadMenuItems();
      alert('Menu item deleted successfully!');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
    loadMenuItems();
  };

  const filteredItems = filterCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === filterCategory);

  if (showForm) {
    return <MenuItemForm item={editingItem} onClose={handleFormClose} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-red-600 hover:text-red-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                McDonald's Admin Panel
              </h1>
              <p className="text-gray-600">Manage menu items, users, and system settings</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/users">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg">
                  <Users className="w-5 h-5" />
                  Manage Users
                </button>
              </Link>
              <button
                onClick={() => setShowForm(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add New Item
              </button>
            </div>
          </div>
        </div>

        <StorageDiagnostic />

        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterCategory === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map(category => {
            const count = menuItems.filter(item => item.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterCategory === category
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Loading menu items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              {filterCategory === 'all' 
                ? 'No menu items yet. Add your first item to get started!' 
                : `No items in ${filterCategory} category.`}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 bg-gray-200">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    item.available 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-red-600 uppercase">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-red-600">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id!)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
