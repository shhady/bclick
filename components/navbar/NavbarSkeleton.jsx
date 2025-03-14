// Create NavbarSkeleton.jsx for loading state

export default function NavbarSkeleton() {
  return (
    <div className="fixed w-full z-50">
      {/* Desktop Skeleton */}
      <div className="hidden md:flex justify-between items-center px-8 py-4 bg-white shadow-lg h-20">
        {/* Logo Skeleton */}
        <div className="w-[100px] h-[100px] bg-gray-200 rounded-full animate-pulse"></div>

        {/* Navigation Items Skeleton */}
        <div className="flex flex-row-reverse justify-center items-center gap-8">
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="w-[28px] h-[28px] bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Right Spacer */}
        <div className="w-[100px]"></div>
      </div>

      {/* Mobile Skeleton */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-lg border-t border-gray-300 h-[70px] flex justify-around items-center pt-3 pb-6">
        {[1, 2, 3, 4].map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <div className="w-[20px] h-[20px] bg-gray-200 rounded animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
} 