'use client'
import React from 'react'
import { Camera, SwitchCamera, Pencil, LogOut, View ,MessageCircle,Copy  } from 'lucide-react';
import { useState } from 'react';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
    
import { useUserContext } from "@/app/context/UserContext";

export default function ProfileMenu({onEdit}) {
    const [logoutPop, setLogoutPop] = useState(false);
    const [openMenu, setOpenMenu] = useState(false);
    const { globalUser, setGlobalUser, setError } = useUserContext();

  return (
    <div className='relative'>
      <div className='bg-customBlue w-8 h-8 text-gray-700 flex justify-center items-center gap-1 rounded-full' onClick={()=>setOpenMenu(!openMenu)}>
        <div className='h-1 w-1 bg-white rounded-full'></div>
         <div className='h-1 w-1 bg-white rounded-full'></div>
              <div className='h-1 w-1 bg-white rounded-full'></div>
      </div>
      {openMenu && <div className='absolute top-10 left-0 w-[220px] bg-white shadow-md flex flex-col gap-3 p-2 text-gray-700'>
      {globalUser.role === 'supplier' && <Link href={`/supplier/${globalUser._id}/supplier-preview`}> <div className='p-3 border-b-2 flex justify-between items-center'><div>תצוגה מקדימה</div> <div><View color='#908E8E' size={18}/></div></div></Link>}
      {globalUser.role === 'supplier' &&   <div className='p-3 flex justify-between items-center'><div>העתק קישור קטלוג</div> <div><Copy color='#908E8E' size={18}/></div></div>}
      {globalUser.role === 'supplier' ?  (<div className='p-3 border-b-2 flex justify-between items-center'><div>שלח קישור לוואטסאפ</div> <div><MessageCircle color='#908E8E' size={18}/></div></div>) :(<div className='p-3 border-b-2 flex justify-between items-center'><div>שלח פרופיל לספק</div> <div><MessageCircle color='#908E8E' size={18}/></div></div>)}

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
  )
}