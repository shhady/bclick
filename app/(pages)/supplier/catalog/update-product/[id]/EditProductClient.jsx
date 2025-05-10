'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Tag, 
  ShoppingBag, 
  BarChart4, 
  ImagePlus, 
  AlertCircle 
} from 'lucide-react';
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Ensure stock and status consistency
  useEffect(() => {
    if (updatedProduct.stock === 0 && updatedProduct.status !== 'hidden') {
      setUpdatedProduct((prev) => ({ ...prev, status: 'out_of_stock' }));
    }
  }, [updatedProduct.stock, updatedProduct.status]);

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
    setUpdating(true);
    
    // Determine the status based on stock and user input
    let finalStatus = updatedProduct.status;
    if (updatedProduct.status === "hidden") {
      // Respect the user's explicit choice for "hidden" status
      finalStatus = "hidden";
    } else if (updatedProduct.stock === 0) {
      // If stock is 0, override and set status to "out_of_stock"
      finalStatus = "out_of_stock";
    } else if (updatedProduct.status === "out_of_stock" && updatedProduct.stock > 0) {
      // If stock becomes positive and status was "out_of_stock", set it to "active"
      finalStatus = "active";
    }
    
    // Create a copy with the adjusted status
    const productToUpdate = {
      ...updatedProduct,
      status: finalStatus
    };
    
    try {
      const response = await retryFetch('/api/products/edit-supplier-products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          supplierId: product.supplierId,
          updates: productToUpdate,
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

  const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
      const formDataToUpload = new FormData();
      formDataToUpload.append('file', file);
      formDataToUpload.append('upload_preset', 'shhady');
      
      const xhr = new XMLHttpRequest();
      
      // Setup progress monitoring
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };
      
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          const response = JSON.parse(this.responseText);
          resolve(response);
        } else {
          reject(new Error('Upload failed'));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('Upload failed'));
      };
      
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`);
      xhr.send(formDataToUpload);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'סוג קובץ לא נתמך',
        description: 'אנא העלה תמונה בפורמט PNG או JPEG',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'קובץ גדול מדי',
        description: 'גודל הקובץ המקסימלי הוא 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Use the new upload with progress method
      const data = await uploadToCloudinary(file);

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
          title: 'התמונה הועלתה בהצלחה',
          variant: 'default',
        });
      }
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'העלאת התמונה נכשלה',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
    <div className="p-4 sm:p-6 max-w-4xl mx-auto mb-24 md:mb-0">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          {/* <button 
            onClick={() => router.back()} 
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button> */}
          <h1 className="text-2xl font-bold text-gray-800">עדכון מוצר</h1>
        </div>
        
        <button
          onClick={() => setOpenDeletePopup(true)}
          className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Trash2 size={18} />
          <span>מחק מוצר</span>
        </button>
      </div>
      
      {/* Main form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <form className="space-y-6">
          {/* Basic Info Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-customBlue" />
              <span>פרטי מוצר בסיסיים</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">קטגוריה</label>
                <select
                  value={updatedProduct.categoryId}
                  onChange={(e) => handleChange('categoryId', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm h-[42px] focus:ring-2 focus:ring-customBlue focus:border-customBlue"
                >
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name} {category.status === 'hidden' ? '(מוסתר)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">שם מוצר</label>
                <input
                  type="text"
                  placeholder="הזן שם מוצר"
                  value={updatedProduct.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-customBlue focus:border-customBlue"
                />
              </div>
            </div>
            
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">תיאור מוצר</label>
              <textarea
                placeholder="הזן תיאור מפורט של המוצר"
                value={updatedProduct.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm mb-4 h-[100px] focus:ring-2 focus:ring-customBlue focus:border-customBlue"
              />
            </div>
          </div>
          
          {/* Inventory Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-customBlue" />
              <span>מלאי ומידות</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">יחידות במוצר</label>
                <input
                  type="text"
                  placeholder="כמות יחידות"
                  value={updatedProduct.units || ''}
                  onChange={(e) => handleChange('units', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-customBlue focus:border-customBlue"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">משקל מוצר</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="משקל"
                    value={updatedProduct.weight || ''}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    className="w-2/3 p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-customBlue focus:border-customBlue"
                  />
                  <select
                    value={updatedProduct.weightUnit || 'גרם'}
                    onChange={(e) => handleChange('weightUnit', e.target.value)}
                    className="w-1/3 p-2.5 border border-gray-300 rounded-lg shadow-sm h-[42px] focus:ring-2 focus:ring-customBlue focus:border-customBlue"
                  >
                    <option value="גרם">גרם</option>
                    <option value="קילוגרם">ק&quot;ג</option>
                    <option value="ליטר">ליטר</option>
                    <option value='מ"ל'>מ&quot;ל</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ברקוד (אופציונלי)</label>
              <input
                type="text"
                placeholder="הזן ברקוד אם קיים"
                value={updatedProduct.barCode || ''}
                onChange={(e) => handleChange('barCode', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-customBlue focus:border-customBlue"
              />
            </div>
          </div>
          
          {/* Pricing & Status Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart4 className="h-5 w-5 text-customBlue" />
              <span>מחיר ומלאי</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">כמות במלאי</label>
                <input
                  type="number"
                  placeholder="כמות במלאי"
                  value={updatedProduct.stock}
                  onChange={(e) => handleChange('stock', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-customBlue focus:border-customBlue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">מחיר (₪)</label>
                <input
                  type="number"
                  placeholder="מחיר"
                  value={updatedProduct.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-customBlue focus:border-customBlue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">סטטוס מוצר</label>
                <select
                  value={updatedProduct.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm h-[42px] focus:ring-2 focus:ring-customBlue focus:border-customBlue"
                >
                  {updatedProduct.status === 'draft' && <option value="draft">טיוטה</option>}
                  <option value="active">פרסם</option>
                  <option value="hidden">מוסתר</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Image Upload Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-customBlue" />
              <span>תמונת מוצר</span>
            </h2>
            
            <div className="w-full">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              
              {/* Image Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-customBlue transition-colors">
                {updatedProduct?.imageUrl?.secure_url ? (
                  <div className="relative">
                    <div className="flex justify-center mb-4">
                      <Image
                        src={updatedProduct.imageUrl.secure_url}
                        alt={updatedProduct.name || 'Product image'}
                        width={200}
                        height={200}
                        className="rounded-md object-contain max-h-64"
                      />
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        type="button"
                        className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <ImagePlus size={18} />
                        החלף תמונה
                      </button>
                      <button
                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        onClick={handleDeleteImage}
                        type="button"
                        disabled={isUploading}
                      >
                        <Trash2 size={18} />
                        מחק
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer py-8"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-3">
                        <ImagePlus size={36} className="text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-700 mb-1"> לחץ לבחירה</p>
                      <p className="text-sm text-gray-500">PNG או JPEG עד 5MB</p>
                    </div>
                  </div>
                )}
                
                {/* Upload Progress Bar */}
                {isUploading && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">מעלה תמונה...</span>
                      <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-customBlue h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleUpdateProduct}
              disabled={updating}
              className={`w-full sm:flex-1 p-2.5 rounded-lg flex items-center justify-center gap-2 ${
                updating 
                  ? 'bg-blue-400 text-white cursor-wait' 
                  : 'bg-customBlue text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
              }`}
            >
              <Save size={18} />
              <span>{updating ? 'מעדכן...' : 'שמור שינויים'}</span>
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>

      {/* Delete Popup */}
      {openDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">האם אתה בטוח?</h2>
              <p className="text-gray-600">פעולה זו תמחק לצמיתות את המוצר &ldquo;{updatedProduct.name}&ldquo;</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDeleteProduct}
                className="w-full sm:flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors"
              >
                מחק לצמיתות
              </button>
              <button
                onClick={() => setOpenDeletePopup(false)}
                className="w-full sm:flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
