'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { ImagePlus, Trash2 } from 'lucide-react';
import crypto from 'crypto';

const generateSHA1 = (data) => {
    const hash = crypto.createHash('sha1');
    hash.update(data);
    return hash.digest('hex');
};

const generateSignature = (publicId, apiSecret, timestamp) => {
  return `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
};

export default function PhotosUpload({ setFormData, formData }) {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'סוג קובץ לא נתמך',
        description: 'אנא העלה תמונה בפורמט PNG או JPEG',
        variant: 'destructive',
        duration: 2000,
      });
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'קובץ גדול מדי',
        description: 'גודל הקובץ המקסימלי הוא 5MB',
        variant: 'destructive',
        duration: 2000,
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

        setFormData((prev) => ({
          ...prev,
          imageUrl: newImage,
        }));
        
        toast({
          title: 'התמונה הועלתה בהצלחה',
          variant: 'default',
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'העלאת התמונה נכשלה',
        variant: 'destructive',
        duration: 2000,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (publicId) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSHA1(generateSignature(publicId, apiSecret, timestamp));

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          signature: signature,
          api_key: apiKey,
          timestamp: timestamp,
        }),
      });

      const data = await response.json();

      if (data.result === 'ok') {
        setFormData((prev) => ({
          ...prev,
          imageUrl: '',
        }));
        
        // Clear file input after successful delete
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        toast({
          title: 'התמונה נמחקה בהצלחה',
          description: '' ,
          variant: 'destructive',
          duration: 2000,
        });
      } else {
        toast({
          title: 'שגיאה',
          description: 'מחיקת התמונה נכשלה',
          variant: 'destructive',
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'An error occurred while deleting the image.',
        variant: 'destructive',
        duration: 2000,
      });
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
      
      {/* Image Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-customBlue transition-colors">
        {formData?.imageUrl?.secure_url ? (
          <div className="relative">
            <div className="flex justify-center mb-4">
              <Image
                src={formData.imageUrl.secure_url}
                alt="Uploaded"
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
                onClick={() => handleDeleteImage(formData.imageUrl.public_id)}
                type="button"
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
  );
}
