'use client';

import React from "react";

export default function DeleteCategoryPopup({
  category,
  setOpenDeletePopup,
  handleDeleteCategory,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        {category.hasProducts ? (
          <>
            <p>
              לא ניתן למחוק קטגוריה זו. יש {category.productCount} מוצרים בקטגוריה.
            </p>
            <button
              onClick={() => setOpenDeletePopup(false)}
              className="px-4 py-2 bg-gray-300 rounded mt-4"
            >
              חזור
            </button>
          </>
        ) : (
          <>
            <p>בטוח שברצונך למחוק את הקטגוריה?</p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => handleDeleteCategory(category._id)}
                className="px-4 py-2 bg-customRed text-white rounded"
              >
                מחק
              </button>
              <button
                onClick={() => setOpenDeletePopup(false)}
                className="px-4 py-2 bg-gray-300 rounded"
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
