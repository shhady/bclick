'use client';

import { useEffect, useState } from 'react';
import { useNewUserContext } from '@/app/context/NewUserContext';
import { useCartContext } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const { newUser } = useNewUserContext();
  const { fetchCartAgain } = useCartContext();
  const router = useRouter();
  const { toast } = useToast();
  const [supplierCarts, setSupplierCarts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllCarts = async () => {
      setLoading(true);
      try {
        if (!newUser || !newUser._id) {
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/carts?clientId=${newUser._id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch carts');
        }
        
        const data = await response.json();
        const allCarts = data.carts || [];
        
        // Group carts by supplier
        const groupedCarts = allCarts.reduce((acc, cart) => {
          const supplierId = typeof cart.supplierId === 'object' 
            ? cart.supplierId._id 
            : cart.supplierId;
            
          // Count total items in cart
          const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
          
          // Calculate total price
          const totalPrice = cart.items.reduce((total, item) => {
            const price = item.productId?.price || 0;
            return total + (price * item.quantity);
          }, 0);
          
          acc.push({
            supplierId,
            supplierName: typeof cart.supplierId === 'object' ? cart.supplierId.businessName : 'ספק',
            itemCount,
            totalPrice,
            imageUrl: typeof cart.supplierId === 'object' && cart.supplierId.profileImage 
              ? cart.supplierId.profileImage 
              : '/no-image.jpg'
          });
          
          return acc;
        }, []);
        
        setSupplierCarts(groupedCarts);
      } catch (error) {
        console.error('Error fetching carts:', error);
        toast({
          title: 'שגיאה בטעינת העגלות',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllCarts();
    // Refresh cart context to ensure it's up to date
    fetchCartAgain();
  }, [newUser, toast, fetchCartAgain]);

  

  if (loading) {
    return (
      <div className="container mx-auto p-4 pb-24 md:pb-16">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <span>העגלות שלי</span>
        </h1>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-customBlue mb-4" />
          <p className="text-gray-500">טוען את העגלות שלך...</p>
        </div>
      </div>
    );
  }

  if (!newUser) {
    return (
      <div className="container mx-auto p-4 pb-24 md:pb-16">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <span>העגלות שלי</span>
        </h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="bg-gray-100 p-4 rounded-full">
              <AlertCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold">התחבר כדי לצפות בעגלות שלך</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              עליך להתחבר כדי לצפות בעגלות הקניות שלך ולהמשיך בתהליך הרכישה.
            </p>
            <Link
              href="/sign-in"
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
          <ShoppingCart className="h-6 w-6" />
          <span>העגלות שלי</span>
        </h1>
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">גישה מוגבלת</h2>
          <p className="text-gray-600 mb-6">רק לקוחות יכולים לצפות בעגלות הקניות</p>
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

  if (supplierCarts.length === 0) {
    return (
      <div className="container mx-auto p-4 pb-24 md:pb-16">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <span>העגלות שלי</span>
        </h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="bg-gray-100 p-4 rounded-full">
              <ShoppingCart className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold">אין לך עגלות קניות</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              לא נמצאו עגלות קניות. בחר ספק והוסף מוצרים לעגלה.
            </p>
            <Link
              href="/newprofile"
              className="px-6 py-3 bg-customBlue text-white rounded-md hover:bg-blue-600 transition flex items-center gap-2"
            >
              <span>חזרה לבחירת ספק</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-24 md:pb-16">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShoppingCart className="h-6 w-6" />
        <span>העגלות שלי</span>
        <span className="text-sm font-normal text-gray-500">({supplierCarts.length} עגלות)</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supplierCarts.map((cart) => (
          <Link 
            key={cart.supplierId} 
            href={`/cart/${cart.supplierId}`}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
             
              <div>
                <h2 className="font-bold text-lg">{cart.supplierName}</h2>
                <p className="text-gray-500">{cart.itemCount} פריטים בעגלה</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <span className="text-gray-600">סה&quot;כ:</span>
              <span className="font-bold text-lg">₪{cart.totalPrice.toFixed(2)}</span>
            </div>
            
            <div className="mt-4 w-full">
              <button className="w-full px-4 py-2 bg-customBlue text-white rounded-md hover:bg-blue-600 transition flex items-center justify-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <span>צפה בעגלה</span>
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 