'use client';
import { SignOutButton } from '@clerk/nextjs';
import { CldUploadButton } from 'next-cloudinary';
import Image from 'next/image';
import { useUserContext } from "@/app/context/UserContext";
import { toast } from '@/hooks/use-toast';
import { Camera, SwitchCamera, Pencil, LogOut } from 'lucide-react';
import { useState } from 'react';
import ProfileMenu from './ProfileMenu';

export default function Profile({ formData, onEdit }) {
  const { globalUser, setGlobalUser, setError } = useUserContext();
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
        setGlobalUser(result);
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

      <div className="flex items-start justify-between gap-4 p-4 shadow-md">
        <div>
          <h1 className="text-1xl font-semibold">{formData.businessName || 'משתמש'}</h1>
          <p>{formData.city}</p>
          <p>{formData.phone || 'טלפון לא הוזן'}</p>
        </div>
        <div className="flex flex-col items-center justify-end gap-2">
          <ProfileMenu onEdit={onEdit}/>
         
        </div>
      </div>

     
    </div>
  );
}
