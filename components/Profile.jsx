'use client';
import { SignOutButton } from '@clerk/nextjs';
import { CldUploadButton } from 'next-cloudinary';
import Image from 'next/image';
import { useUserContext } from "@/app/context/UserContext";
import { toast } from '@/hooks/use-toast';
import { Camera, SwitchCamera } from 'lucide-react';
export default function Profile({ formData, onEdit }) {
  const { globalUser, setGlobalUser, setError } = useUserContext();

  console.log(formData);
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
          ...formData, // Identify the user using Clerk ID
          coverImage: newImage, // Include the new cover image
        }),
      });
  
      if (response.ok) {
        const result = await response.json();
        setGlobalUser(result.user); // Update the globalUser state with the new data
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
console.log(globalUser);
  return (
    <div >
      <div className='h-36 bg-customBlue rounded-b-lg relative'>
      {globalUser?.coverImage && <Image src={globalUser.coverImage.secure_url} width={1000} height={1000} alt='cover' className='w-full h-full object-cover'/>}
      <CldUploadButton
                  uploadPreset="shhady"
                  onSuccess={handleUploadSuccess}
                  className="bg-black opacity-30 text-white px-4 py-2 rounded-md  absolute bottom-1 left-1"
                >
                {globalUser?.coverImage ?  <SwitchCamera />:<Camera />} 
                </CldUploadButton>
      </div>
      <div className="flex items-center justify-between gap-4 p-4 shadow-md">
        {/* <Image
          src={formData.profileImage || '/default-avatar.png'}
          alt={formData.name}
          className="w-20 h-20 rounded-full"
          width={80}
          height={80}
        /> */}
        <div>
          <h1 className="text-1xl font-semibold">{formData.businessName || 'משתמש'}</h1>
          <p>{formData.city}</p>
          <p>{formData.phone || 'טלפון לא הוזן'}</p>
        </div>
        <div className="flex flex-col items-center justify-end gap-2">
      <button
        onClick={onEdit}
        className=" bg-customBlue text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
      >
        עדכן פרטים
      </button>
      
      <SignOutButton className=" bg-red-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full">יציאה</SignOutButton>
      </div>
      </div>
     
    </div>
  );
}
