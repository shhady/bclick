import Image from 'next/image'
import React from 'react'
import { Heart } from 'lucide-react'

export default function SupplierCover({supplier}) {
  return (
    <div className="relative">
      {supplier?.coverImage ? (
        <div className='h-48 md:h-64 lg:h-72 bg-gradient-to-r from-blue-500 to-customBlue rounded-b-3xl overflow-hidden'>
          <Image
            src={supplier.coverImage.secure_url}
            width={1920}
            height={400}
            alt={supplier?.businessName || 'כריכת ספק'}
            className='w-full h-full object-cover'
            priority
            placeholder='blur'
            loading='eager'
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy0vLi44QjhAOEA4Qi4tMkYyLlFQUV5fXl9hZ2hsYWf/2wBDAR..."
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        </div>
      ) : (
        <div className='h-48 md:h-64 lg:h-72 bg-gradient-to-r from-blue-500 to-customBlue rounded-b-3xl'>
          <div className="h-full w-full flex items-center justify-center text-white text-opacity-70 text-xl font-light">
            {supplier?.businessName || 'ספק'}
          </div>
        </div>
      )}
      
      {/* Favorites indicator */}
      {/* <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
        <span className="font-medium text-gray-800">המועדפים שלי</span>
      </div> */}
      
      {/* Supplier name */}
      {/* <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6">
        <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">
          {supplier?.businessName || 'ספק'}
        </h1>
      </div> */}
    </div>
  )
}
