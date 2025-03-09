'use client';
import { useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useNewUserContext } from '@/app/context/NewUserContext';
import { MoreVertical, Edit, LogOut, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NewProfileMenu({ onEdit }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { signOut } = useClerk();
  const router = useRouter();
  const { logout, newUser } = useNewUserContext();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { toast } = useToast();

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

  const handleShareBusinessCard = async () => {
    // Close the menu
    setIsMenuOpen(false);
    
    // Generate the business card URL
    const businessCardUrl = `${window.location.origin}/business-card/${newUser?.businessName || newUser?._id}`;
    
    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `כרטיס ביקור - ${newUser?.name}`,
          text: `כרטיס ביקור של ${newUser?.name} ${newUser?.businessName ? `(${newUser.businessName})` : ''}`,
          url: businessCardUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      try {
        await navigator.clipboard.writeText(businessCardUrl);
        toast({
          title: "הקישור הועתק",
          description: "הקישור לכרטיס הביקור הועתק ללוח",
          variant: "default",
        });
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const renderShareButtonsMobile = () => {
    return (
      <div className="flex flex-col gap-2 p-2 bg-white rounded-md shadow-md w-48">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 p-3 hover:bg-gray-100 rounded-md w-full"
        >
          <Edit size={16} />
          <span>ערוך פרופיל</span>
        </button>
        <button
          onClick={handleShareBusinessCard}
          className="flex items-center gap-2 p-3 hover:bg-gray-100 rounded-md w-full"
        >
          <Share2 size={16} />
          <span>שתף כרטיס ביקור</span>
        </button>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-2 p-3 hover:bg-gray-100 rounded-md w-full text-red-500"
        >
          <LogOut size={16} />
          <span>התנתק</span>
        </button>
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="absolute left-0 bg-white text-blue-600 hover:bg-blue-50 p-3 rounded-full shadow-md transition-all hover:scale-110 z-10"
        >
        <MoreVertical size={20} />
      </button>
      {isMenuOpen && (
        <div className="absolute left-0 mt-12 z-10">
          {renderShareButtonsMobile()}
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
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