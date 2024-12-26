import Loader from '@/components/loader/Loader'
import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse space-y-8 w-full max-w-4xl">
        {/* Header skeleton */}
        <div className="h-[200px] bg-gray-200 rounded-md w-full" />
        
        {/* Title skeleton */}
        <div className="h-8 bg-gray-200 rounded w-48 mx-auto" />
        
        {/* Tabs skeleton */}
        <div className="flex justify-center gap-4">
          <div className="h-10 w-32 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>
        
        {/* Table skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
