'use client';
import { SignOutButton } from '@clerk/nextjs';
import { CldUploadButton } from 'next-cloudinary';
import Image from 'next/image';
import { useUserContext } from "@/app/context/UserContext";
import { toast } from '@/hooks/use-toast';
import { Camera, SwitchCamera, Pencil, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Profile({ formData, onEdit }) {
  const { globalUser, setGlobalUser, setError } = useUserContext();
  const [logoutPop, setLogoutPop] = useState(false);

  const handleUploadSuccess = async (results) => {
    const newImage = {
      public_id: results.info.public_id,
      secure_url: results.info.secure_url,
    };

    try {
      const response = await fetch('/api/users/update-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          coverImage: newImage,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setGlobalUser(result.user);
        toast({
          title: 'תמונה הועלתה בהצלחה',
          description: 'התמונה עודכנה בפרופיל',
          variant: 'default',
        });
      } else {
        throw new Error('Failed to update the user with the new cover image.');
      }
    } catch (error) {
      console.error('Error updating cover image:', error);
      toast({
        title: 'שגיאה',
        description: 'נכשל בעדכון התמונה, אנא נסה שוב.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <div className='h-40 lg:h-48 bg-customBlue rounded-b-lg relative'>
        {globalUser?.coverImage && (
          <Image
            src={globalUser.coverImage.secure_url}
            width={1000}
            height={1000}
            alt='cover'
            className='w-full h-full object-cover'
            priority
          />
        )}
        <CldUploadButton
          uploadPreset="shhady"
          onSuccess={handleUploadSuccess}
          className="bg-black opacity-30 text-white px-4 py-2 rounded-md absolute bottom-1 left-1"
        >
          {globalUser?.coverImage ? <SwitchCamera /> : <Camera />}
        </CldUploadButton>
      </div>

      <div className="flex items-center justify-between gap-4 p-4 shadow-md">
        <div>
          <h1 className="text-1xl font-semibold">{formData.businessName || 'משתמש'}</h1>
          <p>{formData.city}</p>
          <p>{formData.phone || 'טלפון לא הוזן'}</p>
        </div>
        <div className="flex flex-col items-center justify-end gap-2">
          <button
            onClick={onEdit}
            className="bg-gray-300 text-gray-700 text-sm px-4 py-1 rounded-md w-full flex justify-center items-center gap-1"
          >
            <div>ערוך פרופיל</div>
            <Pencil size='14' />
          </button>
          <button
            onClick={() => setLogoutPop(true)}
            className="bg-gray-300 text-gray-700 text-sm px-4 py-1 rounded-md w-full flex justify-center items-center gap-1"
          >
            <div>התנתק</div>
            <LogOut size='14' />
          </button>
        </div>
      </div>

      {logoutPop && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-black opacity-50"></div>

          {/* Popup */}
          <div className="relative bg-white rounded-lg shadow-lg p-6 z-10 w-80 text-center">
            <h2 className="text-lg font-semibold mb-4">בטוח רוצה להתנתק?</h2>
            <div className="flex justify-between gap-4">
              <SignOutButton className="bg-red-500 text-white px-4 py-2 rounded-md w-full">
                התנתק
              </SignOutButton>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md w-full"
                onClick={() => setLogoutPop(false)}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
