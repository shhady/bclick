// UserDetails.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Flag from 'react-flagkit';

export default function UserDetails({ user, onBack }) {
  const router = useRouter();
  useEffect(() => {
    // Scroll to the top of the page when the component mounts
    window.scrollTo(0, 0);
  }, [router.pathname]);
  if (!user) return <div>Loading...</div>; // Show loading while fetching data

  return (
    <div className="bg-white text-black min-h-[70vh] p-4">
      <div className="text-start flex flex-col gap-4 max-w-screen-2xl m-auto">
        <h1 className="text-4xl">تفاصيل المستخدم</h1>
        <div className="border-b-2 md:w-80  "></div>
        <div className="mt-4">
          <h2 className="text-2xl">الاسم: {user.name}</h2>
          <p>ايميل: {user.email}</p>
          <p>الهاتف: {user.phone}</p>
          <p className='flex gap-1'>الدولة: {user.country} {user.countryFlagCode ? <Flag country={user.countryFlagCode} /> : ""} </p>
          <p>ميزانية: {user.budget}</p>
          <p>جاهز: {user.ready}</p>
          <p>كيف: {user.how}</p>
          <p>تاريخ التسجيل: {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <button 
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to All Users
        </button>
      </div>
    </div>
  );
}
