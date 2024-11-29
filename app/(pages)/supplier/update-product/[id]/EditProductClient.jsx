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

  return (
    <>
      <div className="flex items-center justify-center mb-16">
        <div className="p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">ערוך מוצר</h2>
            <Trash2
              className="w-6 h-6 text-black cursor-pointer"
              onClick={() => setOpenDeletePopup(true)}
              title="Delete Product"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">שם מוצר</label>
            <input
              type="text"
              value={updatedProduct.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="שם מוצר"
            />
            <label className="block text-sm font-medium text-gray-700">תיאור</label>
            <textarea
              value={updatedProduct.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="תיאור"
            />
            {/* Units */}
            <label className="block text-sm font-medium text-gray-700">יחידות במוצר</label>
            <input
              value={updatedProduct.units || ''}
              onChange={(e) => handleChange("units", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="יחידות במוצר"
            />
            {/* Weight */}
            <label className="block text-sm font-medium text-gray-700">משקל יחידה</label>
            <input
              value={updatedProduct.weight || ''}
              onChange={(e) => handleChange("weight", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="משקל"
            />
             <label className="block text-sm font-medium text-gray-700">מלאי</label>
            <input
              type="text"
              value={updatedProduct.stock}
              onChange={(e) => handleChange("stock", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="מלאי"
            />
            <label className="block text-sm font-medium text-gray-700">מחיר</label>
            <input
              type="text"
              value={updatedProduct.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="מחיר"
            />
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
           {/* Image Section */}
           <div className="flex gap-4 items-center my-4">
           <div>
            <div>
                <CldUploadButton
                  uploadPreset="shhady"
                  onSuccess={handleUploadSuccess}
                  className="bg-customBlue text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                {updatedProduct?.imageUrl ?  'עדכן תמונה':'העלה תמונה'} 
                </CldUploadButton>
                </div>
                {updatedProduct?.imageUrl && (
                  <button
                    onClick={handleDeleteImage}
                    className="mt-2 bg-red-400 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                     מחק תמונה
                  </button>
                )}
              </div>
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
          <div className="flex justify-between mt-4">
            <button
              onClick={handleUpdateProduct}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              שמור
            </button>
            <button
              onClick={() => setUpdatedProduct(product)}
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
