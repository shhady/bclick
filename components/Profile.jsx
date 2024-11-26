'use client';
import { SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';

export default function Profile({ formData, onEdit }) {
  console.log(formData);
  return (
    <div className="p-4 bg-[#32ADE6]">
      <div className="flex items-center justify-start gap-4">
        <Image
          src={formData.profileImage || '/default-avatar.png'}
          alt={formData.name}
          className="w-20 h-20 rounded-full"
          width={80}
          height={80}
        />
        <div>
          <h1 className="text-2xl font-semibold">{formData.name || 'משתמש'}</h1>
          <p>{formData.email}</p>
          <p>{formData.phone || 'טלפון לא הוזן'}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
      <button
        onClick={onEdit}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        עדכן פרטים
      </button>
      
      <SignOutButton className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">יציאה</SignOutButton>
      </div>
    </div>
  );
}
