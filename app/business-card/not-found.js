import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">כרטיס ביקור לא נמצא</h1>
        <p className="text-lg text-gray-600 mb-8">
          כרטיס הביקור שחיפשת אינו קיים או שהוסר.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-customBlue text-white rounded-xl hover:bg-blue-600 transition-colors shadow-md"
          >
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
} 