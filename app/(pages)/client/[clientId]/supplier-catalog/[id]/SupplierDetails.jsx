// app/client/supplier/[id]/SupplierDetails.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { MapPin, Phone, Building2, Star } from 'lucide-react';
    
import { useNewUserContext } from "@/app/context/NewUserContext";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function SupplierDetails({ 
  supplier, 
  showAll, 
  setShowAll,
  clientId
}) {
  const { newUser } = useNewUserContext();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleContactSupplier = async () => {
    if (!newUser) {
      toast({
        title: "שגיאה",
        description: "עליך להתחבר כדי ליצור קשר עם הספק",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/clients/add-supplier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: newUser._id,
          supplierId: supplier._id,
        }),
      });

      if (response.ok) {
        toast({
          title: "הצלחה",
          description: "הספק נוסף בהצלחה",
        });
        router.push(`/client/${newUser._id}/supplier/${supplier._id}`);
      } else {
        const error = await response.json();
        toast({
          title: "שגיאה",
          description: error.error || "אירעה שגיאה בהוספת הספק",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת הספק",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  };

  return (
    <div>
      <div className="bg-white shadow-md rounded-lg p-4  transform -translate-y-6 mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {supplier?.logo && (
              <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                <Image
                  src={supplier.logo}
                  alt={supplier?.businessName || 'ספק'}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-800">{supplier?.businessName || 'ספק'}</h1>
              <div className="flex gap-2 items-center text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <p>{supplier?.city || 'לא צוין מיקום'}</p>
              </div>
              <div className="flex gap-2 items-center text-gray-600 mt-1">
                <Phone className="h-4 w-4 mr-1" />
                <p>{formatPhone(supplier?.phone)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            {newUser?.role === 'client' ? (
              <Link 
                href={`/favourites/${supplier._id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all bg-amber-100 text-amber-700 hover:bg-amber-200"
              >
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>מועדפים</span>
              </Link>
            ) : (
              <button 
                onClick={handleContactSupplier}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all bg-amber-100 text-amber-700 hover:bg-amber-200 ${
                  isLoading ? 'bg-gray-400' : ''
                }`}
              >
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>{isLoading ? 'מוסיף ספק...' : 'צור קשר עם הספק'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// New component for view mode toggle
