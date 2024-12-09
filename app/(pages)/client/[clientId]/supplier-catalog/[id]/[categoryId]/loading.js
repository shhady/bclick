import React from 'react'

export default function loading() {
  return (
    <div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-4 px-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="border p-4 rounded-lg shadow flex flex-col items-center animate-pulse"
          >
            {/* Skeleton Image */}
            <div className="w-full h-40 bg-gray-300 rounded"></div>
            {/* Skeleton Text */}
            <div className="w-3/4 h-4 bg-gray-300 rounded mt-4"></div>
            <div className="w-1/2 h-4 bg-gray-300 rounded mt-2"></div>
            <div className="w-1/3 h-4 bg-gray-300 rounded mt-2"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
