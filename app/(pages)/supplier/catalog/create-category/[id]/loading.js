import Loader from '@/components/loader/Loader'
import React from 'react'

export default function Loading() {
  return (
    <div className="p-6 max-w-2xl mx-auto mb-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>

      {/* Create Category Input Skeleton */}
      <div className="mb-6">
        <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>

      {/* Categories List Skeleton */}
      {[...Array(5)].map((_, index) => (
        <div 
          key={index} 
          className="p-4 bg-white shadow rounded mb-2"
        >
          {/* Category Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-5 bg-gray-200 rounded w-8"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <div className="h-9 bg-gray-200 rounded w-1/3"></div>
            <div className="h-9 bg-gray-200 rounded w-1/3"></div>
            <div className="h-9 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
