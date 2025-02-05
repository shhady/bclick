import Loader from '@/components/loader/Loader'
import React from 'react'

export default function Loading() {
  return (
    <div className="p-4" dir="rtl">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-200 h-8 w-48 mb-4 rounded"></div>
        
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="bg-gray-200 h-10 flex-1 rounded"></div>
          <div className="bg-gray-200 h-10 w-32 rounded"></div>
        </div>
        
        {/* Orders Table Skeleton */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-200 h-12 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border-b">
              <div className="bg-gray-200 h-6 w-32 rounded"></div>
              <div className="bg-gray-200 h-6 w-24 rounded"></div>
              <div className="bg-gray-200 h-6 w-20 rounded"></div>
              <div className="bg-gray-200 h-6 w-24 rounded"></div>
              <div className="bg-gray-200 h-6 w-32 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
