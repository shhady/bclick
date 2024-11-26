'use client';
import { useState } from 'react';
import { CldUploadButton } from 'next-cloudinary';
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

  const handleUploadSuccess = (results) => {
    const newImage = {
      public_id: results.info.public_id,
      secure_url: results.info.secure_url,
    };

    setFormData((prev) => ({
      ...prev,
      imageUrl: newImage,
    }));

    // toast({
    //   title: 'Success',
    //   description: 'Image uploaded successfully.',
    //   variant: 'default',
    // });
  };

  const handleDeleteImage = async (publicId) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSHA1(generateSignature(publicId, apiSecret, timestamp));

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

    try {
      const response = await fetch(url, {
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
          imageUrl: '', // Remove the image URL
        }));

        toast({
          title: 'נמחקה',
          description: 'התמונה נמחקה בהצלחה',
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
      <CldUploadButton
        uploadPreset="shhady"
        className="w-full p-2 max-w-screen-lg mt-4 inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#303030,45%,white,55%,#303030)] bg-[length:200%_100%] px-6 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
        onSuccess={handleUploadSuccess}
       
      >
        העלאת תמונה
      </CldUploadButton>

      <div className="my-6"></div>

      {formData?.imageUrl?.secure_url && (
        <div className="relative flex justify-center items-center my-4">
          <Image
            src={formData?.imageUrl.secure_url || '/path/one'}
            alt="Uploaded"
            width={200}
            height={200}
            className="rounded-md"
          />
          <button
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
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
