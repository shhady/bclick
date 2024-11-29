'use client';

import { useState, useEffect } from 'react';
import { useUserContext } from '@/app/context/UserContext';
import DeleteCategoryPopup from './DeleteCategoryPopup';

export default function ManageCategories() {
  const { globalUser } = useUserContext();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editCategory, setEditCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [message, setMessage] = useState('');
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectCatStatus, setSelectCatStatus] = useState('')
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!globalUser || !globalUser._id) return;

      try {
        const response = await fetch(`/api/categories/get-categories?supplierId=${globalUser._id}`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          setMessage('Failed to fetch categories.');
        }
      } catch (error) {
        setMessage('Error fetching categories.');
      }
    };

    fetchCategories();
  }, [globalUser]);

  // Clear messages after a delay
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  console.log(categories);
  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategory.trim()) {
      setMessage('Category name is required.');
      return;
    }
  
    try {
      const response = await fetch('/api/categories/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim(), supplierId: globalUser._id }),
      });
  
      if (response.ok) {
        const newCategoryData = await response.json();
        const newCategory = newCategoryData.category
        setCategories((prev) => [
          ...prev,
          { ...newCategory, status: newCategory.status || 'hidden' },
        ]);
        setNewCategory('');
        setMessage('Category created successfully.');
      } else {
        setMessage('Failed to create category.');
      }
    } catch (error) {
      setMessage('Error creating category.');
    }
  };
  // Toggle category status
  const toggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'shown' ? 'hidden' : 'shown';
      const response = await fetch('/api/categories/update-category', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, status: newStatus }),
      });

      if (response.ok) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat._id === categoryId ? { ...cat, status: newStatus } : cat
          )
        );
        
        setMessage(`Category ${newStatus === 'shown' ? 'shown' : 'hidden'}.`);
      } else {
        setMessage('Failed to update category status.');
      }
    } catch (error) {
      setMessage('Error updating category status.');
    }
  };

  // Open edit popup
  const openEditPopup = (categoryId, currentName) => {
    setEditCategory(categoryId);
    setEditCategoryName(currentName);
  };

  // Handle category name edit
  const handleEditCategory = async () => {
    if (!editCategoryName.trim()) {
      setMessage('Category name cannot be empty.');
      return;
    }

    try {
      const response = await fetch('/api/categories/update-category', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: editCategory, name: editCategoryName.trim() }),
      });

      if (response.ok) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat._id === editCategory ? { ...cat, name: editCategoryName.trim() } : cat
          )
        );
        setEditCategory(null);
        setMessage('Category name updated successfully.');
      } else {
        setMessage('Failed to update category name.');
      }
    } catch (error) {
      setMessage('Error updating category name.');
    }
  };

  // Close edit popup
  const closeEditPopup = () => {
    setEditCategory(null);
    setEditCategoryName('');
  };

  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await fetch('/api/categories/delete-category', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId }),
      });

      if (response.ok) {
        setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
        setOpenDeletePopup(false);
        setMessage('Category deleted successfully.');
      } else {
        setMessage('Failed to delete category.');
      }
    } catch (error) {
      setMessage('Error deleting category.');
    }
  };

  const setOpen = (cat)=>{
    setOpenDeletePopup(true);
    setSelectedCategory(cat._id);
    setSelectCatStatus(cat.status)
  }
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">צור קטגוריה חדשה</h1>

      {/* Create Category */}
      <div className="mb-6">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="בחר שם לקטגוריה"
          className="p-2 border rounded w-full"
        />
        <button
          onClick={handleCreateCategory}
          className="mt-2 px-4 py-2 bg-customBlue text-white rounded w-full"
        >
          צור קטגוריה
        </button>
      </div>

      {/* Category List */}
      {categories.map((category, i) => (
  <div
    key={i} // Use the unique `_id` of the category as the key
    className="flex-col items-center justify-between p-4 bg-white shadow rounded mb-2"
  >

    <span>{category.name}</span>

    <div className="flex items-center  gap-2">
      <button
        onClick={() => toggleCategoryStatus(category._id, category.status)}
        className={`px-4 py-2 rounded w-1/3 text-sm ${
          category.status === 'shown' ? 'bg-green-200 border-2 border-gray-500 text-black' : 'bg-gray-200 border-2 border-gray-500 text-black'
        }`}
      >
        {category.status === 'shown' ? 'מוצג בקטלוג' : 'הצג בקטלוג'}
      </button>
      <button
        onClick={() => openEditPopup(category._id, category.name)}
        className="px-4 py-2 w-1/3 border-2 border-gray-500 rounded text-sm"
      >
        ערוך שם
      </button>
      <button
        onClick={() => setOpen(category)}
        className="px-4 py-2 w-1/3 border-2 border-gray-500 rounded text-sm"
      >
        מחק
      </button>
    </div>
  </div>
))}
      {/* Edit Category Popup */}
      {editCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Edit Category</h2>
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
                Submit
              </button>
              <button
                onClick={closeEditPopup}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    {openDeletePopup &&
       <DeleteCategoryPopup status={selectCatStatus} toggleCategoryStatus={toggleCategoryStatus} selectedCategory={selectedCategory} setOpenDeletePopup={setOpenDeletePopup} handleDeleteCategory={handleDeleteCategory}/>  }
      {/* Message Display */}
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
