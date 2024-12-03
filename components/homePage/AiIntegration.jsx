import React from 'react'
import Image from 'next/image'
export default function AiIntegration() {
  return (
    <div className='mt-10 text-center'>
        <div className='p-6 flex flex-col justify-center items-center gap-4'>
        <Image src='/analysis.jpg' alt='manage' width={1000} height={1000} className='w-full max-w-3xl'/>
        <h2 className='text-[24px] font-semibold'>דו&quot;חות וניתוחים חכמים:</h2>
            <h3 className='text-[20px]'>מעקב אחרי ביצועים וסטטיסטיקות בעזרת בינה מלאכותית.  </h3></div>
    </div>
  )
}
