import Image from 'next/image'
import React from 'react'

export default function SupplierCover({supplier}) {
  return (
    <div>
        {supplier?.coverImage && (
        <div className='h-50 lg:h-72 bg-customBlue rounded-b-xl '>
          <Image
            src={supplier?.coverImage?.secure_url}
            width={1000}
            height={1000}
            alt='cover'
            className='w-full h-full object-cover max-h-1/4'
            priority
          />
        </div>
      )}
    </div>
  )
}
