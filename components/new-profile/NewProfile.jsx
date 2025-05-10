'use client';
import Image from 'next/image';
import { useNewUserContext } from "@/app/context/NewUserContext";
import { toast } from '@/hooks/use-toast';
import { Camera, ImagePlus, MapPin, Phone, Building2, Mail, Edit, X, LogOut, CreditCard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import NewProfileMenu from './NewProfileMenu';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function NewProfile({ formData, onEdit }) {
  const { newUser, setNewUser, logout } = useNewUserContext();
  const { signOut } = useClerk();
  const router = useRouter();
  const [displayData, setDisplayData] = useState(formData);
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCoverUploadModal, setShowCoverUploadModal] = useState(false);
  const [showProfileUploadModal, setShowProfileUploadModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Refs for file inputs
  const coverImageInputRef = useRef(null);
  const profileImageInputRef = useRef(null);
  
  // Update displayData when formData or newUser changes
  useEffect(() => {
    
    // Prioritize newUser data over formData
    const sourceData = newUser || formData;
    
    if (sourceData) {
      // Create a copy with trimmed string values
      const trimmedData = Object.entries(sourceData).reduce((acc, [key, value]) => {
        acc[key] = typeof value === 'string' ? value.trim() : value;
        return acc;
      }, {});
      setDisplayData(trimmedData);
    }
  }, [formData, newUser]);

  const uploadToCloudinary = async (file, setProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'shhady');
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Setup progress monitoring
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
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
      
      xhr.open('POST', 'https://api.cloudinary.com/v1_1/shhady/image/upload');
      xhr.send(formData);
    });
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
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
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'קובץ גדול מדי',
        description: 'גודל הקובץ המקסימלי הוא 10MB',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setUploadingCover(true);
      setShowCoverUploadModal(false);
      
      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, setUploadProgress);
      
      const newImage = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };

      // Update user in database
      const response = await fetch('/api/users/update-cover-image', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: newUser.clerkId,
          coverImage: newImage,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Set the new user data directly
        setNewUser(result);
        
        // Also update the local displayData state to immediately reflect changes
        setDisplayData({...displayData, coverImage: result.coverImage});
        
        toast({
          title: 'תמונת רקע הועלתה בהצלחה',
          description: 'התמונה עודכנה בפרופיל',
          variant: 'default',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update the cover image');
      }
    } catch (error) {
      console.error('Error updating cover image:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'נכשל בעדכון התמונה, אנא נסה שוב.',
        variant: 'destructive',
      });
    } finally {
      setUploadingCover(false);
      // Reset the file input
      if (coverImageInputRef.current) {
        coverImageInputRef.current.value = '';
      }
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
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
    
    try {
      setUploadingProfile(true);
      setShowProfileUploadModal(false);
      
      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, setUploadProgress);
      
      // Update user in database
      const response = await fetch('/api/users/update-profile-image', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: newUser.clerkId,
          profileImage: result.secure_url,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Set the new user data directly
        setNewUser(result);
        
        // Also update the local displayData state to immediately reflect changes
        setDisplayData({...displayData, profileImage: result.profileImage});
        
        toast({
          title: 'תמונת פרופיל הועלתה בהצלחה',
          description: 'תמונת הפרופיל עודכנה',
          variant: 'default',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update the profile image');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'נכשל בעדכון תמונת הפרופיל, אנא נסה שוב.',
        variant: 'destructive',
      });
    } finally {
      setUploadingProfile(false);
      // Reset the file input
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = '';
      }
    }
  };

  const handleSignOut = async () => {
    try {
      // First clear the user context and session storage
      logout();
      
      // Then sign out from Clerk
      await signOut();
      
      // Finally navigate to home page
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigateToBusinessCard = () => {
    // Properly encode the business name for URL safety
    const businessName = displayData?.businessName || displayData?._id;
    const encodedBusinessName = encodeURIComponent(businessName);
    const businessCardUrl = `/business-card/${encodedBusinessName}`;
    router.push(businessCardUrl);
  };

  // Use displayData for rendering, with fallbacks
  const cityToDisplay = displayData?.city?.trim() || 'לא צוין';
  const businessNameToDisplay = displayData?.businessName || 'משתמש';
  const phoneToDisplay = displayData?.phone || 'טלפון לא הוזן';
  const emailToDisplay = displayData?.email || 'אימייל לא הוזן';
  const addressToDisplay = displayData?.address || 'כתובת לא הוזנה';
  const areaToDisplay = displayData?.area || 'אזור לא הוזן';
  const businessNumberToDisplay = displayData?.businessNumber || 'מספר עסק לא הוזן';
  const roleToDisplay = displayData?.role === 'supplier' ? 'ספק' : 
                        displayData?.role === 'client' ? 'לקוח' : 
                        displayData?.role === 'admin' ? 'מנהל' : 'משתמש';

  // Default cover image if none exists
  const defaultCoverImage = '/images/default-cover.jpg';
  const coverImageUrl = newUser?.coverImage?.secure_url || defaultCoverImage;
  
  // Default profile image
  const profileImageUrl = displayData?.profileImage || 'https://res.cloudinary.com/shhady/image/upload/v1700000000/default-avatar_rlcgvx.png';

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl mx-auto">
      {/* Hero Section with Cover Image */}
      <div 
        className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Cover Image with Overlay */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={coverImageUrl}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
          <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isHovering ? 'bg-opacity-50' : 'bg-opacity-30'}`}></div>
          
          {/* Cover Image Edit Indicator (visible on hover) */}
          {isHovering && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-lg font-medium">לחץ על הכפתור לעדכון תמונת רקע</span>
            </div>
          )}
        </div>
        
        {/* Cover Image Upload Button - Repositioned and made more prominent */}
        {/* <button
          onClick={() => coverImageInputRef.current.click()}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 text-blue-600 hover:bg-blue-50 p-5 rounded-full shadow-lg transition-all hover:scale-110 z-10"
        >
          <Camera size={30} />
        </button>
         */}
        {/* Secondary Cover Image Upload Button - Bottom right for easier access */}
        <button
          onClick={() => coverImageInputRef.current.click()}
          className="absolute top-20 left-4 bg-white text-blue-600 hover:bg-blue-50 p-3 rounded-full shadow-md transition-all hover:scale-110 z-10"
        >
          <Camera size={20} />
        </button>
        
        {/* Hidden file input for cover image */}
        <input 
          type="file"
          ref={coverImageInputRef}
          onChange={handleCoverImageChange}
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
        />
        
        {/* Cover Image Upload Progress Bar (shown when uploading) */}
        {uploadingCover && (
          <div className="absolute bottom-16 left-4 right-4 bg-white p-3 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">מעלה תמונת רקע...</span>
              <span className="text-sm">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Profile Menu - Top Right */}
        <div className="absolute top-4 left-4 z-10">
          <NewProfileMenu onEdit={onEdit} />
        </div>
        
        {/* Role Badge - Top Left */}
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold shadow-md">
          {roleToDisplay}
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="relative -mt-24">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Profile Header with Avatar */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
            <div 
              className="relative"
              onMouseEnter={() => setIsHoveringProfile(true)}
              onMouseLeave={() => setIsHoveringProfile(false)}
            >
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100">
                <Image
                  src={profileImageUrl}
                  width={128}
                  height={128}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Profile Image Upload Button */}
              <button
                onClick={() => profileImageInputRef.current.click()}
                className="absolute -bottom-2 -right-2 bg-white text-blue-600 hover:bg-blue-50 p-2 rounded-full shadow-md transition-all hover:scale-110"
              >
                <Camera size={20} />
              </button>
              
              {/* Hidden file input for profile image */}
              <input 
                type="file"
                ref={profileImageInputRef}
                onChange={handleProfileImageChange}
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
              />
              
              {/* Profile Image Upload Progress (shown when uploading) */}
              {uploadingProfile && (
                <div className="absolute -bottom-16 right-0 bg-white p-2 rounded-lg shadow-lg w-40">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">מעלה תמונה...</span>
                    <span className="text-xs">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-right">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{businessNameToDisplay}</h1>
              <p className="text-blue-600 font-medium mb-2 hidden md:block">{businessNumberToDisplay}</p>
              
              <div className="flex flex-col sm:flex-row gap-2 mt-2 justify-center sm:justify-end">
                <button 
                  onClick={navigateToBusinessCard}
                  className="inline-flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  <CreditCard size={16} />
                  כרטיס ביקור
                </button>
                
                <button 
                  onClick={onEdit}
                  className="inline-flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  <Edit size={16} />
                  ערוך פרופיל
                </button>
                
                <button 
                  onClick={() => setShowLogoutConfirm(true)}
                  className="inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  <LogOut size={16} />
                  התנתק
                </button>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Phone size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">טלפון</p>
                <p dir="ltr" className="font-medium">{phoneToDisplay}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Mail size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">אימייל</p>
                <p className="font-medium">{emailToDisplay}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <MapPin size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">כתובת</p>
                <p className="font-medium">{addressToDisplay}, {cityToDisplay}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Building2 size={18} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">אזור</p>
                <p className="font-medium">{areaToDisplay}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4 text-center">האם אתה בטוח שברצונך להתנתק?</h2>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleSignOut();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                התנתק
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
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