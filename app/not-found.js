import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#2C3E50] mb-4">404 - דף לא נמצא</h1>
        <p className="text-gray-600 mb-8">הדף שחיפשת אינו קיים</p>
        <Link 
          href="/" 
          className="text-white bg-customBlue hover:text-[#96691E] font-medium px-4 py-4 rounded"
        >
          חזור לדף הבית
        </Link>
      </div>
    </div>
  );
} 