
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function page() {
  
  return (
    <div>
      <div className="container mx-auto p-4 pb-24 md:pb-16">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="bg-gray-100 p-4 rounded-full">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold">לא נבחר קטלוג</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              אנא בחר ספק כדי לצפות בקטלוג המוצרים שלו
            </p>
            <Link
              href="/newprofile"
              className="px-6 py-3 bg-customBlue text-white rounded-md hover:bg-blue-600 transition flex items-center gap-2"
            >
              <span>חזרה לבחירת ספק</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
