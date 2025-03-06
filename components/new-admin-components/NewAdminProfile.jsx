'use client';
import { useState, useEffect } from 'react';
import { useNewUserContext } from '@/app/context/NewUserContext';
import NewProfileMenu from '@/components/new-profile/NewProfileMenu';

export default function NewAdminProfile() {
  const { newUser } = useNewUserContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">פרופיל מנהל</h1>
          <NewProfileMenu onEdit={() => {}} />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">פרטי מנהל</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">שם:</p>
              <p className="font-medium">{newUser?.name || 'מנהל מערכת'}</p>
            </div>
            <div>
              <p className="text-gray-600">אימייל:</p>
              <p className="font-medium">{newUser?.email || 'admin@bclick.co.il'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">פעולות ניהול</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-customBlue text-white py-2 px-4 rounded-md hover:bg-blue-600 transition">
              ניהול משתמשים
            </button>
            <button className="bg-customBlue text-white py-2 px-4 rounded-md hover:bg-blue-600 transition">
              ניהול הזמנות
            </button>
            <button className="bg-customBlue text-white py-2 px-4 rounded-md hover:bg-blue-600 transition">
              הגדרות מערכת
            </button>
            <button className="bg-customBlue text-white py-2 px-4 rounded-md hover:bg-blue-600 transition">
              דוחות
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 