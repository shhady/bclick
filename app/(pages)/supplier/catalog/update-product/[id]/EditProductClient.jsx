'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function EditProductClient({ product, categories }) {
  const [updatedProduct, setUpdatedProduct] = useState({ ...product });
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Ensure stock and status consistency
  useEffect(() => {
    if (updatedProduct.stock === 0 && updatedProduct.status !== 'hidden') {
      setUpdatedProduct((prev) => ({ ...prev, status: 'out_of_stock' }));
    }
  }, [updatedProduct.stock,updatedProduct.status]);

  const handleChange = (field, value) => {
    setUpdatedProduct((prev) => ({ ...prev, [field]: value }));
  };

  const retryFetch = async (url, options, retries = 3) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error('Failed to fetch');
      return response;
    } catch (error) {
      if (retries > 0) {
        return retryFetch(url, options, retries - 1);
      }
      throw error;
    }
  };

  const handleUpdateProduct = async () => {
    
    setUpdating(true)
    // Determine the status based on stock and user input
    if (updatedProduct.status === "hidden") {
   // Respect the user's explicit choice for "hidden" status
   updatedProduct.status = "hidden";
 } else if (updatedProduct.stock === 0) {
   // If stock is 0, override and set status to "out_of_stock"
   updatedProduct.status = "out_of_stock";
 } else if (updatedProduct.status === "out_of_stock" && updatedProduct.stock > 0) {
   // If stock becomes positive and status was "out_of_stock", set it to "active"
   updatedProduct.status = "active";
 }
    
    try {
      const response = await retryFetch('/api/products/edit-supplier-products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          supplierId: product.supplierId,
          updates: updatedProduct,
        }),
      });

      if (response.ok) {
        toast({
          title: 'עדכון',
          description: 'פרטי המוצר עודכנו בהצלחה',
        });
        router.push(`/supplier/${product.supplierId}/catalog`);
      }
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'שגיאה בעדכון מוצר, תנסה מחדש',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const response = await fetch('/api/products/delete-supplier-product', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, supplierId: product.supplierId }),
      });

      if (response.ok) {
        toast({
          title: 'המוצר נמחק',
          description: '',
          variant: 'destructive',
        });
        router.push(`/supplier/${product.supplierId}/catalog`);
      } else {
        throw new Error('Failed to delete product.');
      }
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'שגיאה קרתה במהלך המחיקה, תנסה שוב',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'shhady');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        const newImage = {
          public_id: data.public_id,
          secure_url: data.secure_url,
        };

        setUpdatedProduct((prev) => ({
          ...prev,
          imageUrl: newImage,
        }));

        toast({
          title: 'העלאה הצליחה',
          description: 'התמונה הועלתה בהצלחה',
        });
      }
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'שגיאה בהעלאת התמונה',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add this useEffect to monitor imageUrl changes
  useEffect(() => {
    console.log('Current imageUrl:', updatedProduct.imageUrl); // Debug log
  }, [updatedProduct.imageUrl]);

  const handleDeleteImage = () => {
    setUpdatedProduct((prev) => ({
      ...prev,
      imageUrl: null, // Remove the image reference
    }));

    toast({
      title: 'מחיקה',
      description: 'התמונה נמחקה בהצלחה',
      variant: 'destructive',
    });
  };

  const handleCancel = () => {
    router.push(`/supplier/${product.supplierId}/catalog`);
  };

  return (
    <>
      <div className="flex items-center justify-center mb-24">
        <div className="p-6 max-w-xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">ערוך מוצר</h2>
            <Trash2
              className="w-6 h-6 text-black cursor-pointer"
              onClick={() => setOpenDeletePopup(true)}
              title="Delete Product"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Product Fields */}
            <div>
                      <label className="block text-sm font-medium text-gray-700">שם מוצר</label>

            <input
              type="text"
              value={updatedProduct.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="שם מוצר"
            />
            </div>
            <div>

            <label className="block text-sm font-medium text-gray-700">תיאור מוצר</label>

            <textarea
              value={updatedProduct.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="תיאור"
            />
            </div>
            {/* Units */}
            <div>
            <label className="block text-sm font-medium text-gray-700">יחידות במוצר</label>

<input
  value={updatedProduct.units || ''}
  onChange={(e) => handleChange('units', e.target.value)}
  className="w-full p-2 border rounded"
  placeholder="יחידות במוצר"
/>
            </div>
             
            {/* Weight */}
            <div>
            <label className="block text-sm font-medium text-gray-700">משקל יחידה</label>

           
            <div className="flex gap-2">
              
              <input
                value={updatedProduct.weight || ''}
                onChange={(e) => handleChange('weight', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="משקל"
              />
               <select
           value={updatedProduct.weightUnit || 'בחר'}
           onChange={(e) => handleChange("weightUnit", e.target.value)}
           className="w-1/2 p-2 border border-gray-300 rounded h-[42px]"
         >
           {updatedProduct.weightUnit ? <option value={updatedProduct.weightUnit}>{updatedProduct.weightUnit}</option> : <option>בחר</option>}
           {updatedProduct.weightUnit === 'גרם' ? "" : <option value="גרם">גרם</option>}
           {updatedProduct.weightUnit === 'קילוגרם' ? "" : <option value="קילוגרם">קילו</option>}
           {updatedProduct.weightUnit === 'ליטר' ? "" : <option value="ליטר">ליטר</option>}
           {updatedProduct.weightUnit === 'מ"ל' ? "" :  <option value='מ&quot;ל'>מ&quot;ל</option>}
         </select>
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700">ברקוד</label>
            <input
              value={updatedProduct.barCode || ''}
              onChange={(e) => handleChange('barCode', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="ברקוד"
            />
            </div>

            <div>

            
                     <label className="block text-sm font-medium text-gray-700">מלאי</label>

            <input
              type="number"
              value={updatedProduct.stock}
              onChange={(e) => handleChange('stock', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="מלאי"
            /></div>
            <div>
            <label className="block text-sm font-medium text-gray-700">מחיר</label>
            <input
              type="number"
              value={updatedProduct.price}
              onChange={(e) => handleChange('price', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="מחיר"
            />
            </div>
            
            {/* Category */}
            <div>
             <label className="block text-sm font-medium text-gray-700">סטטוס</label>
             <select
           value={updatedProduct.status}
           onChange={(e) => handleChange("status", e.target.value )}
           className="w-full p-2 border border-gray-300 rounded mb-4 h-[42px]"
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
  onChange={(e) => handleChange('categoryId', e.target.value)}
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

          {/* Image Upload */}
          <div className="mt-4">
            <div className='flex justify-center items-center gap-4'>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`${
                  isUploading ? 'bg-gray-400' : 'bg-customBlue hover:bg-hoveredBlue'
                } text-white px-4 py-2 rounded-md w-2/4 text-center cursor-pointer`}
              >
                {isUploading 
                  ? 'מעלה תמונה...' 
                  : updatedProduct?.imageUrl 
                    ? 'עדכן תמונה' 
                    : 'העלה תמונה'}
              </button>
              {updatedProduct?.imageUrl && (
                <button
                  onClick={handleDeleteImage}
                  className="bg-customRed text-white px-4 py-2 rounded-md hover:bg-red-700 w-2/4"
                  disabled={isUploading}
                >
                  מחק תמונה
                </button>
              )}
            </div>
            
            {updatedProduct?.imageUrl?.secure_url ? (
              <div className='flex justify-center items-center mt-4'>
                <Image
                  src={updatedProduct.imageUrl.secure_url}
                  alt={product.name || 'Product image'}
                  width={200}
                  height={200}
                  className="rounded-md object-contain"
                  priority
                />
              </div>
            ) : (
              <div className='flex justify-center items-center mt-4 h-[200px] w-[200px] border rounded-md'>
                <p className="text-gray-400">No image uploaded</p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4 justify-between mt-4">
            <button
              onClick={handleUpdateProduct}
              className={`px-4 py-2 ${updating ? 'bg-gray-400' : 'bg-customBlue text-white'} rounded-md hover:bg-hoveredBlue`}
              disabled={updating}
            >
              {updating ? 'מעדכן...' : 'שמור'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              ביטול
            </button>
          </div>
        </div>
      </div>

      {/* Delete Popup */}
      {openDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2>בטוח רוצה למחוק?</h2>
            <div className="mt-4 flex justify-around">
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-customRed text-white rounded-md"
              >
                מחק
              </button>
              <button
                onClick={() => setOpenDeletePopup(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
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
