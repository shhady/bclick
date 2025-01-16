import React from "react";
import { Trash2 } from "lucide-react";

export default function EditProductPopup({ product, categories, onUpdate, onDelete, onClose }) {
  const [updatedProduct, setUpdatedProduct] = React.useState({ ...product });
  const [openDeletePopup, setOpenDeletePopup] = React.useState(false)
  const handleChange = (field, value) => {
    setUpdatedProduct((prev) => ({ ...prev, [field]: value }));
  };

  const deletePopup = ()=>{
    setOpenDeletePopup(true)
  }
  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">עריכת מוצר</h2>
          <Trash2
            className="w-6 h-6 text-black cursor-pointer"
            onClick={() => deletePopup()}
            title="Delete Product"
          />
        </div>
        <div className="space-y-2">
          {/* Product Name */}
          <label className="block text-sm font-medium text-gray-700">שם מוצר</label> 
            <input
            type="text"
            value={updatedProduct.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="שם מוצר"
          />

          {/* Product Description */}
          <label className="block text-sm font-medium text-gray-700">תיאור</label> 

          <textarea
            value={updatedProduct.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="תיאור מוצר"
          />

          {/* Stock */}
          <label className="block text-sm font-medium text-gray-700">מלאי</label> 

          <input
            type="number"
            value={updatedProduct.stock}
            onChange={(e) => handleChange("stock", Number(e.target.value))}
            className="w-full p-2 border rounded"
            placeholder="מלאי"
          />

          {/* Price */}
          <label className="block text-sm font-medium text-gray-700">מחיר</label> 

          <input
            type="number"
            value={updatedProduct.price}
            onChange={(e) => handleChange("price", Number(e.target.value))}
            className="w-full p-2 border rounded"
            placeholder="מחיר"
          />

          {/* Category Selector */}
          <label className="block text-sm font-medium text-gray-700">קטגוריה</label> 

          <select
            value={updatedProduct.categoryId}
            onChange={(e) => handleChange("categoryId", e.target.value)}
            className="w-full p-2 border rounded"
          >
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <label className="block text-sm font-medium text-gray-700">סטטוס</label> 

          {/* Status Selector */}
          <select
            value={updatedProduct.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="active">פורסם</option>
            <option value="hidden">מוסתר</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => onUpdate(updatedProduct)}
            className="px-4 py-2 bg-customBlue text-white rounded hover:bg-blue-600"
          >
            שמור
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
    {openDeletePopup && <div className="z-50 fixed w-full min-h-screen flex justify-center items-center  inset-0 bg-black bg-opacity-50 ">
      <div className="bg-white p-8 rounded-xl">
        <div>{product.name}</div>
              <div>בטוח רוצה למחוק ? </div>
               <div className="w-full flex justify-between items-center mt-8 gap-8">
                <button className="bg-customRed px-4 py-2 rounded-lg text-white" onClick={()=>onDelete(product._id)}>מחק</button>
                <button className="bg-gray-500 px-4 py-2 rounded-lg text-white" onClick={()=>setOpenDeletePopup(false)}>ביטול</button>
                </div>
                </div> 
       </div>}

    </>
  );
}
