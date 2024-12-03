import React from 'react'
import {  SignUpButton } from '@clerk/nextjs';
export default function StartNow() {
  return (
    <div className='mt-10 text-center'>
        <div className='p-6 flex flex-col justify-center items-center gap-4'>
        <h2 className='text-[24px] font-semibold'>מתחילים עכשיו!</h2>
            <h3 className='text-[20px]'>הירשם למערכת BClick והתחל לנהל את העסק שלך בצורה חכמה יותר. </h3>
            <SignUpButton
              style={{
                background: '#3997D3',
                border: '1px solid white',
                borderRadius: '15px',
                height: '48px',
                width: '250px',
                color: 'white',
              }}
            >
              צור חשבון
            </SignUpButton>
            </div>
    </div>
  )
}
