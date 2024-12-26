import Loader from '@/components/loader/Loader'
import React from 'react'

export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Supplier Cover Skeleton - Fixed height */}
      <div className="h-[200px] w-full bg-gray-200 rounded-lg" />
      
      {/* Supplier Details Skeleton - Fixed dimensions */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-start space-x-4 rtl:space-x-reverse">
          
          <div className="flex-1 space-y-3">
            <div className="h-[24px] bg-gray-200 rounded w-[200px]" />
            <div className="h-[20px] bg-gray-200 rounded w-[150px]" />
          </div>
          <div className="w-[64px] h-[64px] bg-gray-200  flex-shrink-0" />
        </div>
      </div>

      {/* Categories Skeleton - Fixed height */}
      <div className="overflow-hidden">
        <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex-none w-[128px] h-[32px] bg-gray-200 rounded" />
          ))}
        </div>
      </div>

      {/* Products Grid Skeleton - Fixed aspect ratio */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="aspect-[3/4] border rounded-lg p-4">
            <div className="w-full aspect-square bg-gray-200 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
