'use client';

import { useState } from "react";
import DeleteCategoryPopup from "./DeleteCategoryPopup";
import { Plus, Edit2, Trash2, PackageCheck, Eye, EyeOff, Loader2 } from "lucide-react";

export default function ManageCategoriesClient({ categoriesWithProductStatus, categories, supplierId }) {
  const [categoryList, setCategoryList] = useState(categoriesWithProductStatus);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);

  const handleToggleStatus = async (categoryId, currentStatus) => {
    const newStatus = currentStatus === "shown" ? "hidden" : "shown";
    try {
      const response = await fetch("/api/categories/update-category", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, status: newStatus }),
      });

      if (response.ok) {
        setCategoryList((prev) =>
          prev.map((category) =>
            category._id === categoryId ? { ...category, status: newStatus } : category
          )
        );
      } else {
        console.error("Failed to update category status");
      }
    } catch (error) {
      console.error("Error updating category status:", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await fetch("/api/categories/delete-category", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
      });

      if (response.ok) {
        setCategoryList((prev) => prev.filter((category) => category._id !== categoryId));
        setOpenDeletePopup(false);
      } else {
        console.error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleEditCategory = async () => {
    if (!editCategoryName.trim()) return;

    try {
      const response = await fetch("/api/categories/update-category", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: editCategory, name: editCategoryName.trim() }),
      });

      if (response.ok) {
        setCategoryList((prev) =>
          prev.map((category) =>
            category._id === editCategory ? { ...category, name: editCategoryName.trim() } : category
          )
        );
        setEditCategory(null);
        setEditCategoryName("");
      } else {
        console.error("Failed to update category name");
      }
    } catch (error) {
      console.error("Error updating category name:", error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    setIsCreatingNewCategory(true);
    try {
      const response = await fetch("/api/categories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim(), supplierId }),
      });

      if (response.ok) {
        const newCategoryData = await response.json();
        setCategoryList((prev) => [...prev, newCategoryData.category]);
        setNewCategory("");
      } else {
        console.error("Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
    } finally {
      setIsCreatingNewCategory(false);
    }
  };

  const openEditPopup = (categoryId, currentName) => {
    setEditCategory(categoryId);
    setEditCategoryName(currentName);
  };

  const closeEditPopup = () => {
    setEditCategory(null);
    setEditCategoryName("");
  };

  const openDeletePopupHandler = (category) => {
    setSelectedCategory(category);
    setOpenDeletePopup(true);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto mb-24 md:mb-0">
      {isCreatingNewCategory && (
        <div className="fixed w-full h-screen bg-black bg-opacity-25 top-0 left-0 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-customBlue" />
            <span>יוצר קטגוריה...</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <PackageCheck className="h-6 w-6 text-customBlue mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">ניהול קטגוריות</h1>
        </div>
        <p className="text-gray-600 text-sm">צור וערוך קטגוריות מוצרים עבור הקטלוג שלך</p>
      </div>

      {/* Add New Category Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-customBlue" />
          <span>הוספת קטגוריה חדשה</span>
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="שם הקטגוריה החדשה"
            className="flex-1 p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-customBlue focus:border-customBlue"
          />
          <button
            onClick={handleCreateCategory}
            disabled={isCreatingNewCategory || !newCategory.trim()}
            className={`px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 ${
              !newCategory.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-customBlue text-white hover:bg-blue-600 shadow-sm hover:shadow-md transition-all duration-300"
            }`}
          >
            <Plus size={18} />
            <span>צור קטגוריה</span>
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">רשימת קטגוריות ({categoryList.length})</h2>
        
        <div className="space-y-4">
          {categoryList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>אין עדיין קטגוריות. צור קטגוריה חדשה למעלה.</p>
            </div>
          ) : (
            categoryList.map((category) => (
              <div key={category._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex-shrink-0 w-3 h-3 ${category.status === "shown" ? "bg-green-500" : "bg-gray-400"} rounded-full`}></div>
                    <span className="font-medium text-gray-800">{category.name}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {category.productCount || 0} מוצרים
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <button
                      onClick={() => handleToggleStatus(category._id, category.status)}
                      className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                        category.status === "shown"
                          ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {category.status === "shown" ? (
                        <>
                          <Eye size={16} />
                          <span>מוצג</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={16} />
                          <span>מוסתר</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => openEditPopup(category._id, category.name)}
                      className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 text-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 size={16} />
                      <span>ערוך</span>
                    </button>
                    
                    <button
                      onClick={() => category.hasProducts ? null : openDeletePopupHandler(category)}
                      className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                        category.hasProducts 
                          ? "bg-gray-100 text-gray-400 border border-gray-200 relative group cursor-help"
                          : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                      }`}
                    >
                      <Trash2 size={16} />
                      <span>{category.hasProducts ? "לא ניתן למחוק" : "מחק"}</span>
                      
                      {category.hasProducts && (
                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 text-white text-xs rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-right">
                          יש למחוק את כל המוצרים בקטגוריה זו תחילה ({category.productCount} מוצרים)
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Category Popup */}
      {editCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-customBlue" />
              <span>ערוך שם קטגוריה</span>
            </h2>
            
            <input
              type="text"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm mb-5 focus:ring-2 focus:ring-customBlue focus:border-customBlue"
            />
            
            <div className="flex gap-3">
              <button
                onClick={handleEditCategory}
                disabled={!editCategoryName.trim()}
                className={`flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 ${
                  !editCategoryName.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-customBlue text-white hover:bg-blue-600"
                }`}
              >
                <span>שמור שינויים</span>
              </button>
              
              <button
                onClick={closeEditPopup}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Popup */}
      {openDeletePopup && selectedCategory && (
        <DeleteCategoryPopup
          category={selectedCategory}
          setOpenDeletePopup={setOpenDeletePopup}
          handleDeleteCategory={handleDeleteCategory}
        />
      )}
    </div>
  );
}
