'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { UserPlus, Smile, Users as UsersIcon, Settings } from "lucide-react";
import { getAllUsers } from '@/lib/userService';

export default function Home() {
  const [userCount, setUserCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserCount();
  }, []);

  const loadUserCount = async () => {
    try {
      const users = await getAllUsers();
      setUserCount(users.length);
    } catch (error) {
      console.error('Error loading user count:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            WhoMe - Customer Recognition System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Recognize and greet your customers with AI-powered face recognition technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Link href="/register">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 p-6 rounded-full mb-6">
                  <UserPlus className="w-16 h-16 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Register New Customer
                </h2>
                <p className="text-gray-600 mb-6">
                  Add new customers to your database with face scanning technology
                </p>
                <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
                  Start Registration
                </div>
              </div>
            </div>
          </Link>

          <Link href="/greet">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 p-6 rounded-full mb-6">
                  <Smile className="w-16 h-16 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Greet Mode
                </h2>
                <p className="text-gray-600 mb-6">
                  Automatically recognize and greet registered customers
                </p>
                <div className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold">
                  Start Greeting
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow cursor-pointer border-2 border-transparent hover:border-red-500">
              <div className="flex flex-col items-center text-center">
                <div className="bg-red-100 p-6 rounded-full mb-6">
                  <Settings className="w-16 h-16 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Admin Panel
                </h2>
                <p className="text-gray-600 mb-6">
                  Manage McDonald's menu items, prices, and availability
                </p>
                <div className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold">
                  Manage Menu
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <UsersIcon className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">Registered Customers</h3>
            </div>
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              <div className="text-5xl font-bold text-blue-600">{userCount}</div>
            )}
            <p className="text-gray-600 text-sm mt-2">
              {userCount === 0 ? 'No customers registered yet' : `Total customer${userCount !== 1 ? 's' : ''} in database`}
            </p>
          </div>

         
        </div>
      </div>
    </div>
  );
}
