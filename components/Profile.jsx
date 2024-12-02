'use client';
import { SignOutButton } from '@clerk/nextjs';
import { CldUploadButton } from 'next-cloudinary';
import Image from 'next/image';
import { useUserContext } from "@/app/context/UserContext";
import { toast } from '@/hooks/use-toast';
import { Camera, SwitchCamera, Pencil,LogOut  } from 'lucide-react';

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
      <div className='h-42 md:h-52 bg-customBlue rounded-b-lg relative'>
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
        className=" bg-gray-300 text-gray-700 text-sm  px-4 py-1 rounded-md w-full flex justify-center items-center gap-1"
      >
        <div> ערוך פרופיל</div>
      <Pencil size='14'/> 
      
      </button>
      
      <SignOutButton className=" bg-gray-300 text-gray-700 text-sm px-4 py-1 rounded-md  w-full flex justify-end items-center gap-1">
       <div>
       <div>התנתק</div>
       <LogOut size='14'/>
        </div>
      </SignOutButton>
      </div>
      </div>
     
    </div>
  );
}
