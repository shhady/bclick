import React from 'react'
import Link from 'next/link';
export default function StartNow() {
  return (
    <div className='mt-10 text-center'>
        <div className='p-6 flex flex-col justify-center items-center gap-4'>
        <h2 className='text-[24px] font-semibold'>מתחילים עכשיו!</h2>
            <h3 className='text-[20px]'>הירשם למערכת BClick והתחל לנהל את העסק שלך בצורה חכמה יותר. </h3>
            <Link
              href="/sign-up"
              className="bg-[#3997D3] border border-white rounded-[15px] h-12 w-[250px] flex items-center justify-center text-white"
            >
              צור חשבון
            </Link>
            </div>
    </div>
  )
}
