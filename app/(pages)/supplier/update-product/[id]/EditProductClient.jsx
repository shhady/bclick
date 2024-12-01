'use client';

import React, { useState } from 'react';
import { Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CldUploadButton } from 'next-cloudinary';

export default function EditProductClient({ product, categories }) {
  const [updatedProduct, setUpdatedProduct] = useState({ ...product });
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleChange = (field, value) => {
    setUpdatedProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProduct = async () => {
    try {
      const response = await fetch("/api/products/edit-supplier-products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          supplierId: product.supplierId,
          updates: updatedProduct,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product updated successfully.",
        });
        router.push(`/supplier/${product.supplierId}/catalog`);
      } else {
        throw new Error("Failed to update product.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the product.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const response = await fetch("/api/products/delete-supplier-product", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, supplierId: product.supplierId }),
      });

      if (response.ok) {
        toast({
          title: "Deleted",
          description: "Product deleted successfully.",
          variant: "destructive",
        });
        router.push(`/supplier/${product.supplierId}/catalog`);
      } else {
        throw new Error("Failed to delete product.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the product.",
        variant: "destructive",
      });
    }
  };

  const handleUploadSuccess = (results) => {
    const newImage = {
      public_id: results.info.public_id,
      secure_url: results.info.secure_url,
    };

    setUpdatedProduct((prev) => ({
      ...prev,
      imageUrl: newImage,
    }));

    toast({
      title: 'Success',
      description: 'Image uploaded successfully.',
      variant: 'default',
    });
  };

  const handleDeleteImage = () => {
    setUpdatedProduct((prev) => ({
      ...prev,
      imageUrl: null, // Remove the image reference
    }));

    toast({
      title: 'Deleted',
      description: 'Image removed successfully.',
      variant: 'destructive',
    });
  };

  const handleCancel = (product)=>{
    router.push(`/supplier/${product.supplierId}/catalog`);
  }
  return (
    <>
      <div className="flex items-center justify-center mb-16">
        <div className="p-6 max-w-xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">ערוך מוצר</h2>
            <Trash2
              className="w-6 h-6 text-black cursor-pointer"
              onClick={() => setOpenDeletePopup(true)}
              title="Delete Product"
            />
          </div>
          <div className="grid grid-cols-1 md:grid lg:grid-cols-2 justify-center items-start gap-3">
            <div>
            <label className="block text-sm font-medium text-gray-700">שם מוצר</label>
            <input
              type="text"
              value={updatedProduct.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="שם מוצר"
            />
            </div>
            <div>

            <label className="block text-sm font-medium text-gray-700">תיאור</label>
            <textarea
              value={updatedProduct.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="תיאור"
            />
            </div>
            {/* Units */}
            <div>

            <label className="block text-sm font-medium text-gray-700">יחידות במוצר</label>
            <input
              value={updatedProduct.units || ''}
              onChange={(e) => handleChange("units", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="יחידות במוצר"
            />
            </div>
            {/* Weight */}
            <div>

            <label className="block text-sm font-medium text-gray-700">משקל יחידה</label>
          
             <div className="flex items-center lg:mb-4">
             <input
              value={updatedProduct.weight || ''}
              onChange={(e) => handleChange("weight", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="משקל"
            />
            
          <select
            value={updatedProduct.weightUnit || 'בחר'}
            onChange={(e) => handleChange("weightUnit", e.target.value)}
            className="w-1/3 p-2 border border-gray-300 rounded ml-2"
          >
            {updatedProduct.weightUnit ? <option value={updatedProduct.weightUnit}>{updatedProduct.weightUnit}</option> : <option>בחר</option>}
            {updatedProduct.weightUnit === 'גרם' ? "" : <option value="גרם">גרם</option>}
            {updatedProduct.weightUnit === 'קילוגרם' ? "" : <option value="קילוגרם">קילוגרם</option>}
            {updatedProduct.weightUnit === 'ליטר' ? "" : <option value="ליטר">ליטר</option>}
            {updatedProduct.weightUnit === 'מ"ל' ? "" :  <option value='מ&quot;ל'>מ&quot;ל</option>}
          </select>
        </div>
        </div>
        <div className='lg:mb-4'>

            <label className="block text-sm font-medium text-gray-700">ברקוד</label>
            <input
              value={updatedProduct.barCode || ''}
              onChange={(e) => handleChange("barCode", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="ברקוד"
            />
        </div>
        <div>

             <label className="block text-sm font-medium text-gray-700">מלאי</label>
            <input
              type="text"
              value={updatedProduct.stock}
              onChange={(e) => handleChange("stock", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="מלאי"
            />
        </div>
        <div>

            <label className="block text-sm font-medium text-gray-700">מחיר</label>
            <input
              type="text"
              value={updatedProduct.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="מחיר"
            />
        </div>
        <div>

                        <label className="block text-sm font-medium text-gray-700">סטטוס</label>

            <select
          value={updatedProduct.status}
          onChange={(e) => handleChange("status", e.target.value )}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        >
          {updatedProduct.status === 'draft' && <option value="draft">טיוטה</option>}
          <option value="active">פרסם</option>
          <option value="hidden">מוסתר</option>
        </select>
        </div>
        <div>

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
        </div>
          </div>
           {/* Image Section */}
           <div className="grid grid-cols-2 gap-4 justify-center items-center my-4">
           <div className='grid grid-cols-1 gap-4 justify-center items-center'>
            <div>
                <CldUploadButton
                  uploadPreset="shhady"
                  onSuccess={handleUploadSuccess}
                  className="bg-customBlue text-white px-4 py-2 rounded-md hover:bg-blue-600 w-3/4"
                >
                {updatedProduct?.imageUrl ?  'עדכן תמונה':'העלה תמונה'} 
                </CldUploadButton>
                </div>
                {updatedProduct?.imageUrl && (
                  <button
                    onClick={handleDeleteImage}
                    className="mt-2 bg-red-400 text-white px-4 py-2 rounded-md hover:bg-red-600 w-3/4"
                  >
                     מחק תמונה
                  </button>
                )}
              </div>
              <div className='flex justify-center items-center'>
              {updatedProduct?.imageUrl?.secure_url && (
                <Image
                  src={updatedProduct.imageUrl.secure_url}
                  alt={product.name}
                  width={150}
                  height={150}
                  className="rounded-md w-48 h-48 object-contain"
                />
              )}
              </div>
             
              
            </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={handleUpdateProduct}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              שמור
            </button>
            <button
              onClick={() => handleCancel(product)}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              ביטול
            </button>
          </div>
        </div>
      </div>
      {openDeletePopup && (
        <div className="z-50 fixed w-full min-h-screen flex justify-center items-center inset-0 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-xl">
            <div>{product.name}</div>
            <div>בטוח רוצה למחוק?</div>
            <div className="w-full flex justify-between items-center mt-8 gap-8">
              <button
                className="bg-red-500 px-4 py-2 rounded-lg text-white"
                onClick={handleDeleteProduct}
              >
                מחק
              </button>
              <button
                className="bg-gray-500 px-4 py-2 rounded-lg text-white"
                onClick={() => setOpenDeletePopup(false)}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
