'use client';

import { useState } from "react";
import DeleteCategoryPopup from "./DeleteCategoryPopup";

export default function ManageCategoriesClient({ categoriesWithProductStatus }) {
  const [categoryList, setCategoryList] = useState(categoriesWithProductStatus);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

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

    try {
      const response = await fetch("/api/categories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
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
    <div className="p-6 max-w-2xl mx-auto mb-16">
      <h1 className="text-xl font-bold mb-4">ניהול קטגוריות</h1>

      <div className="mb-6">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="הוסף קטגוריה חדשה"
          className="p-2 border rounded w-full mb-2"
        />
        <button
          onClick={handleCreateCategory}
          className="bg-customBlue text-white px-4 py-2 rounded w-full"
        >
          צור קטגוריה
        </button>
      </div>

      {categoryList.map((category) => (
        <div key={category._id} className="p-4 bg-white shadow rounded mb-2">
            <div className="flex items-center gap-2">
          <p><strong>{category.name}</strong></p>
          <p> {category.hasProducts ? `(${category.productCount})` : "(0)"}</p>
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <button
              onClick={() => handleToggleStatus(category._id, category.status)}
              className={`px-2 py-2 rounded border w- text-sm w-1/3 ${
                category.status === "shown" ? "bg-green-200" : "bg-gray-200"
              }`}
            >
              {category.status === "shown" ? "מוצג בקטלוג" : "הצג בקטלוג"}
            </button>
            <button
              onClick={() => openEditPopup(category._id, category.name)}
              className="px-4 py-2 border rounded  text-sm w-1/3"
            >
              ערוך שם
            </button>
            <button
              onClick={() => openDeletePopupHandler(category)}
              className="px-4 py-2 border text-black rounded  text-sm w-1/3"
            >
              מחק
            </button>
          </div>
        </div>
      ))}

      {editCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">ערוך שם קטגוריה</h2>
            <input
              type="text"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              className="p-2 border rounded w-full mb-4"
            />
            <div className="flex justify-between">
              <button
                onClick={handleEditCategory}
                className="px-4 py-2 bg-customBlue text-white rounded"
              >
                שמור
              </button>
              <button
                onClick={closeEditPopup}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

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
