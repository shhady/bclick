import Loader from '@/components/loader/Loader'
import React from 'react'

export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Supplier Cover Skeleton */}
      <div className="h-48 bg-gray-200 w-full rounded-lg mb-6"></div>
      
      {/* Supplier Details Skeleton */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-start space-x-4 mb-6">
        <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="w-16 h-16 bg-gray-200"></div>
        </div>
      </div>

      {/* Categories Skeleton */}
      <div className="flex gap-4 overflow-x-auto p-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex-none w-32">
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="border p-4 rounded-lg">
            <div className="w-full h-40 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
