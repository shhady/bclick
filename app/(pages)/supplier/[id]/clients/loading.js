
export default function Loading() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
        <div className="h-10 w-32 bg-gray-200 rounded"></div>
      </div>

      {/* Filter Section Skeleton */}
      <div className="flex gap-4 mb-6">
        <div className="h-10 w-32 bg-gray-200 rounded"></div>
        <div className="h-10 w-32 bg-gray-200 rounded"></div>
      </div>

      {/* Table Header Skeleton */}
      <div className="grid grid-cols-6 gap-4 mb-4 p-4 bg-gray-100 rounded">
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
      </div>

      {/* Client Rows Skeleton */}
      {[...Array(5)].map((_, index) => (
        <div 
          key={index}
          className="grid grid-cols-6 gap-4 p-4 bg-white rounded shadow mb-2"
        >
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-6 w-24 bg-gray-200 rounded"></div>
          <div className="h-6 w-24 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  )
}
