'use client'
import React from 'react'
import { Camera, SwitchCamera, Pencil, LogOut, View ,MessageCircle,Copy  } from 'lucide-react';
import { useState } from 'react';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { SlHandbag } from "react-icons/sl";
import { FaWhatsapp } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

import { useUserContext } from "@/app/context/UserContext";

export default function ProfileMenu({onEdit}) {
    const [logoutPop, setLogoutPop] = useState(false);
    const [openMenu, setOpenMenu] = useState(false);
    const { globalUser, setGlobalUser, logout } = useUserContext();
    const router = useRouter();
    const { signOut } = useClerk();

    const handleSignOut = async () => {
      try {
        // First clear the user context and session storage using our logout function
        logout();
        
        // Then sign out from Clerk
        await signOut();
        
        // Finally navigate to home page
        router.push('/');
      } catch (error) {
        console.error('Error during sign out:', error);
      }
    };

  const renderShareButtonsMobile = () => {
   // if (pathName === '/profile' && globalUser?.role === 'client' || pathName === '/orders' && globalUser?.role === 'client')  {
      
      const shareBody = `פרטים:\n\nשם: ${globalUser?.name}\nטלפון: ${globalUser?.phone}\nאימייל: ${globalUser?.email}\nשם עסק: ${globalUser?.businessName}\nמספר לקוח: ${globalUser?.clientNumber}\n`;

      return (
        <div className="">
          <Link
            href={`https://wa.me/?text=${encodeURIComponent(shareBody)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600  flex flex-col md:flex-row justify-center items-center gap-1"
          >
            <div className='p-3  border-b-2 flex justify-between items-center gap-2'>
           <div>שלח פרופיל לספק</div> <div><FaWhatsapp color='#908E8E' size={18}/></div>
           </div>
          </Link>
        </div>
      );
   // }
    //return null;
  };
  return (
    <div className='relative'>
      <div className={`${openMenu ? 'bg-customBlue' : 'bg-gray-300'} cursor-pointer w-8 h-8 text-gray-700 flex justify-center items-center gap-1 rounded-full`} onClick={()=>setOpenMenu(!openMenu)}>
        <div className='h-1 w-1 bg-white rounded-full'></div>
         <div className='h-1 w-1 bg-white rounded-full'></div>
              <div className='h-1 w-1 bg-white rounded-full'></div>
      </div>
      {openMenu && <div className='absolute top-10 left-0 w-[220px] bg-white shadow-md flex flex-col gap-3 p-2 text-gray-700'>
      {globalUser.role === 'supplier' && <Link href={`/supplier/${globalUser._id}/supplier-preview`}> <div className='p-3 border-b-2 flex justify-between items-center hover:bg-customGray rounded-lg'><div>תצוגה מקדימה</div> <div><View color='#908E8E' size={18}/></div></div></Link>}
      {globalUser.role === 'supplier' &&   <div className='p-3 flex justify-between items-center hover:bg-customGray rounded-lg'><div>העתק קישור קטלוג</div> <div><Copy color='#908E8E' size={18}/></div></div>}
      {globalUser.role === 'supplier' ?  (<div className='p-3 border-b-2 flex justify-between items-center hover:bg-customGray rounded-lg'><div>שלח קישור לוואטסאפ</div> <div><MessageCircle color='#908E8E' size={18}/></div></div>) :(<div className='hover:bg-customGray rounded-lg'>{renderShareButtonsMobile()}</div>)}

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
      </div>}
       

{logoutPop && (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Popup */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 z-10 w-80 text-center">
        <h2 className="text-lg font-semibold mb-4">בטוח רוצה להתנתק?</h2>
        <div className="flex justify-between gap-4">
          <button
            onClick={handleSignOut}
            className="bg-customRed text-white px-4 py-2 rounded-md w-full"
          >
            התנתק
          </button>
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
  )
}
