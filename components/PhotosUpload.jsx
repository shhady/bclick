'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
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

  const handleUpload = async (e) => {
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

        setFormData((prev) => ({
          ...prev,
          imageUrl: newImage,
        }));
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
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
        });
      } else {
        toast({
          title: 'Error',
          description: 'מחיקת התמונה נכשלה',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the image.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        type="button"
        className={`w-full p-2 max-w-screen-lg mt-4 inline-flex h-12 items-center justify-center rounded-md  border-slate-800 
          ${isUploading 
            ? 'bg-gray-700 animate-pulse cursor-not-allowed' 
            : 'bg-gray-300 text-gray-700'
          } 
          hover:bg-gray-400 px-6 font-medium  transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50`}
      >
        {isUploading ? 'מעלה תמונה...' : 'העלאת תמונה'}
      </button>

      <div className="my-6"></div>

      {formData?.imageUrl?.secure_url && (
        <div className="relative flex justify-center items-center my-4">
          <Image
            src={formData?.imageUrl.secure_url}
            alt="Uploaded"
            width={200}
            height={200}
            className="rounded-md"
          />
          <button
            className="absolute top-2 right-2 bg-customRed text-white p-1 rounded"
            onClick={() => handleDeleteImage(formData.imageUrl.public_id)}
            type="button"
          >
            מחק
          </button>
        </div>
      )}
    </>
  );
}
