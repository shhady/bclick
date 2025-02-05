import Loader from '@/components/loader/Loader'
import React from 'react'

export default function Loading() {
  return (
    <div className="p-4">
      <div className="animate-pulse">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-8">
            {[...Array(4)].map((_, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 mt-2"></div>
                </div>
                {i < 3 && <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
