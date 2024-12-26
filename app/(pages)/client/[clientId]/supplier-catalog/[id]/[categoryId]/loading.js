import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="animate-pulse space-y-8">
        <div className="h-40 bg-gray-200 rounded-md"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-60 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
