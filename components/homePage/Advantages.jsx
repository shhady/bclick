import Image from 'next/image'
import React from 'react'

export default function Advantages() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center gap-4 text-center mt-10'>
        <div className='p-6 flex flex-col justify-center items-center gap-4'>
            <Image src='/first.png' alt='manage' width={1000} height={1000} className='max-h-48 max-w-48 h-36'/>
            <h2 className='text-[24px] font-semibold'>ניהול קטלוג בקלות </h2>
            <h3 className='text-[20px]'>ספקים יכולים להעלות קטלוג מוצרים מפורט, לעדכן מחירים, ותמונות תוך דקות.</h3>
        </div>
        <div className='p-6 flex flex-col justify-center items-center gap-4'>
        <Image src='/second.png' alt='manage' width={1000} height={1000} className='max-h-48 max-w-48 h-36'/>
        <h2 className='text-[24px] font-semibold'>גישה חופשית ללקוחות</h2>
            <h3 className='text-[20px]'>לקוחות יכולים לצפות בקטלוג ולעשות הזמנות ללא עלות.</h3></div>
            <div className='p-6 flex flex-col justify-center items-center gap-4'>
            <Image src='/third.png' alt='manage' width={1000} height={1000} className='max-h-48 max-w-48 h-36'/>
        <h2 className='text-[24px] font-semibold'>תמיכה במובייל ובדסקטופ</h2>
            <h3 className='text-[20px]'>גישה מכל מכשיר, בכל זמן.</h3></div>
            <div className='p-6 flex flex-col justify-center items-center gap-4'>
            <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M54.1666 10.8334H75.8333" stroke="#C00F0C" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M65 75.8334L81.25 59.5834" stroke="#C00F0C" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M65 119.167C88.9323 119.167 108.333 99.7657 108.333 75.8333C108.333 51.901 88.9323 32.5 65 32.5C41.0676 32.5 21.6666 51.901 21.6666 75.8333C21.6666 99.7657 41.0676 119.167 65 119.167Z" stroke="#C00F0C" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
        <h2 className='text-[24px] font-semibold'>חסכון בזמן ובעלויות:</h2>
            <h3 className='text-[20px]'>כל תהליך ההזמנה מרוכז במקום אחד.</h3></div>

    </div>
  )
}
