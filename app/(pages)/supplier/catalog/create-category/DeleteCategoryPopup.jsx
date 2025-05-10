'use client';

import React from "react";
import { AlertTriangle, Info, X, AlertCircle } from "lucide-react";

export default function DeleteCategoryPopup({
  category,
  setOpenDeletePopup,
  handleDeleteCategory,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        {category.hasProducts ? (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-amber-100 p-3 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">לא ניתן למחוק קטגוריה עם מוצרים</h2>
              <div className="text-gray-600 space-y-2">
                <p>
                  הקטגוריה &quot;<span className="font-semibold">{category.name}</span>&quot; מכילה <span className="font-semibold">{category.productCount}</span> מוצרים.
                </p>
                <div className="bg-amber-50 border-r-4 border-amber-500 text-amber-800 p-3 rounded-lg mt-3 text-right">
                  <p className="font-bold mb-1">שים לב:</p>
                  <p>יש למחוק או להעביר את כל המוצרים מקטגוריה זו לפני שתוכל למחוק אותה.</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpenDeletePopup(false)}
              className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300"
            >
              הבנתי
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">האם אתה בטוח?</h2>
              <p className="text-gray-600">
                האם ברצונך למחוק את הקטגוריה &quot;{category.name}&quot;? פעולה זו אינה ניתנת לביטול.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleDeleteCategory(category._id)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <X size={18} />
                <span>מחק לצמיתות</span>
              </button>
              <button
                onClick={() => setOpenDeletePopup(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300"
              >
                ביטול
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
