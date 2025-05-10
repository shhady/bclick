import React from 'react'

export default function Loading() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto mb-24 md:mb-0">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="h-6 w-6 bg-gray-200 rounded-full mr-2"></div>
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-64 bg-gray-200 rounded"></div>
      </div>

      {/* Create Category Card Skeleton */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-32 sm:w-40 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Categories List Skeleton */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Category Title & Badge */}
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-3 h-3 bg-gray-200 rounded-full"></div>
                  <div className="h-5 w-32 bg-gray-200 rounded"></div>
                  <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <div className="h-9 w-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-9 w-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-9 w-20 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
