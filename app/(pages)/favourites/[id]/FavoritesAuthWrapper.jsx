'use client';

import { useNewUserContext } from '@/app/context/NewUserContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/loader/Loader';
import Link from 'next/link';
import { Heart, AlertCircle } from 'lucide-react';

export default function FavoritesAuthWrapper({ children, supplierId }) {
  const { newUser, isLoading } = useNewUserContext();
  const router = useRouter();

  useEffect(() => {
    // Store the current supplier ID for navbar navigation
    if (typeof window !== 'undefined' && supplierId) {
      localStorage.setItem('currentSupplierId', supplierId);
    }
  }, [supplierId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader />
        <p className="mt-4 text-gray-600">טוען...</p>
      </div>
    );
  }

  if (!newUser) {
    return (
      <div className="container mx-auto p-4 pb-24 md:pb-16">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Heart className="h-6 w-6 fill-red-500 text-red-500" />
          <span>המועדפים שלי</span>
        </h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="bg-gray-100 p-4 rounded-full">
              <AlertCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold">התחבר כדי לצפות במועדפים שלך</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              עליך להתחבר כדי לצפות ברשימת המועדפים שלך.
            </p>
            <Link
              href="/login"
              className="px-6 py-3 bg-customBlue text-white rounded-md hover:bg-blue-600 transition flex items-center gap-2"
            >
              <span>התחבר</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (newUser.role !== 'client') {
    return (
      <div className="container mx-auto p-4 pb-24 md:pb-16">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Heart className="h-6 w-6 fill-red-500 text-red-500" />
          <span>המועדפים שלי</span>
        </h1>
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">גישה מוגבלת</h2>
          <p className="text-gray-600 mb-6">רק לקוחות יכולים לצפות ברשימת המועדפים</p>
          <Link 
            href="/newprofile" 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            חזרה לפרופיל
          </Link>
        </div>
      </div>
    );
  }

  return children;
} 