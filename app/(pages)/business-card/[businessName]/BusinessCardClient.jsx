'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Mail, MapPin, Building, User, Share2, ExternalLink, Download, Clipboard, Check, MapPinned } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BusinessCardClient({ profileUser, viewer }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState('');
  
  // Generate QR code on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`);
    }
  }, []);
  
  // Function to handle adding a client to supplier's related users
  const handleAddClient = async () => {
    if (!viewer.id || viewer.role !== 'supplier' || profileUser.role !== 'client') {
      return;
    }
    
    setIsAddingClient(true);
    
    try {
      const response = await fetch('/api/suppliers/add-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: viewer.id,
          clientId: profileUser._id,
        }),
      });

      if (response.ok) {
        toast({
          title: "הצלחה",
          description: "הלקוח נוסף בהצלחה!",
          variant: "default",
        });
        
        // Refresh the page to update the UI
        router.refresh();
      } else {
        const error = await response.json();
        toast({
          title: "שגיאה",
          description: error.error || "נכשל להוסיף את הלקוח",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת הלקוח",
        variant: "destructive",
      });
    } finally {
      setIsAddingClient(false);
    }
  };
  
  // Function to navigate to catalog preview
  const navigateToCatalogPreview = () => {
    if (profileUser.role === 'supplier' && profileUser.businessName) {
      router.push(`/catalog-preview/${profileUser.businessName}`);
    }
  };
  
  // Function to share the business card
  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `כרטיס ביקור - ${profileUser.name}`,
          text: `כרטיס ביקור של ${profileUser.name} ${profileUser.businessName ? `(${profileUser.businessName})` : ''}`,
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast({
          title: "הקישור הועתק",
          description: "הקישור לכרטיס הביקור הועתק ללוח",
          variant: "default",
        });
        
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };
  
  // Function to download vCard
  const downloadVCard = () => {
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profileUser.name}`,
      profileUser.businessName ? `ORG:${profileUser.businessName}` : '',
      profileUser.phone ? `TEL;TYPE=WORK,VOICE:${profileUser.phone}` : '',
      profileUser.email ? `EMAIL;TYPE=WORK:${profileUser.email}` : '',
      profileUser.address ? `ADR;TYPE=WORK:;;${profileUser.address};${profileUser.city || ''};${profileUser.country || ''};;;` : '',
      'END:VCARD'
    ].filter(Boolean).join('\n');
    
    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profileUser.name.replace(/\s+/g, '_')}_contact.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Function to toggle QR code display
  const toggleQRCode = () => {
    setShowQR(!showQR);
  };
  
  // Get area name in Hebrew
  const getAreaName = (area) => {
    const areaMap = {
      'north': 'צפון',
      'south': 'דרום',
      'center': 'מרכז',
      'jerusalem': 'ירושלים',
      'all-areas': 'כל האזורים'
    };
    
    return areaMap[area] || area;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-10">
      {/* Cover Image with Gradient Overlay */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden">
        {profileUser.coverImage?.secure_url ? (
          <>
            <img
              src={profileUser.coverImage.secure_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
        )}
      </div>
      
      {/* Profile Card */}
      <div className="max-w-3xl mx-auto -mt-24 relative z-10 px-4 opacity-0 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-slideUp">
          {/* Profile Header */}
          <div className="relative pt-24 md:pt-20 pb-6 md:pb-8 px-4 md:px-6 text-center">
            {/* Profile Image */}
            <div className="absolute -top-20 md:-top-24 left-1/2 transform -translate-x-1/2 animate-fadeIn" style={{animationDelay: "0.2s"}}>
              <div className="h-36 w-36 md:h-40 md:w-40 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-lg flex items-center justify-center">
                {profileUser.logo?.secure_url ? (
                  <img
                    src={profileUser.logo.secure_url}
                    alt={profileUser.name}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center' }}
                  />
                ) : profileUser.profileImage ? (
                  <img
                    src={profileUser.profileImage}
                    alt={profileUser.name}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center' }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                    <User size={64} className="text-blue-500" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Name and Business */}
            <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-1 animate-fadeIn" style={{animationDelay: "0.3s"}}>
              {profileUser.name}
            </h1>
            
            {profileUser.businessName && (
              <p className="text-xl text-gray-600 mb-3 animate-fadeIn" style={{animationDelay: "0.4s"}}>
                {profileUser.businessName}
              </p>
            )}
            
            {/* Role Badge */}
            <div className="mb-4 animate-fadeIn" style={{animationDelay: "0.5s"}}>
              <span className={`inline-block px-4 py-1.5 text-sm font-medium rounded-full ${
                profileUser.role === 'supplier' 
                  ? 'bg-blue-100 text-blue-800' 
                  : profileUser.role === 'client'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {profileUser.role === 'supplier' 
                  ? 'ספק' 
                  : profileUser.role === 'client'
                  ? 'לקוח'
                  : profileUser.role}
              </span>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-4 animate-fadeIn" style={{animationDelay: "0.6s"}}>
              {profileUser.phone && (
                <a 
                  href={`tel:${profileUser.phone}`}
                  className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <Phone size={18} className="md:hidden" />
                  <Phone size={20} className="hidden md:block" />
                </a>
              )}
              
              {profileUser.email && (
                <a 
                  href={`mailto:${profileUser.email}`}
                  className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                >
                  <Mail size={18} className="md:hidden" />
                  <Mail size={20} className="hidden md:block" />
                </a>
              )}
              
              {(profileUser.address || profileUser.city) && (
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent([profileUser.address, profileUser.city, profileUser.country].filter(Boolean).join(', '))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <MapPin size={18} className="md:hidden" />
                  <MapPin size={20} className="hidden md:block" />
                </a>
              )}
              
              <button
                onClick={toggleQRCode}
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
              >
                <QRCodeIcon size={18} className="md:hidden" />
                <QRCodeIcon size={20} className="hidden md:block" />
              </button>
              
              <button
                onClick={downloadVCard}
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
              >
                <Download size={18} className="md:hidden" />
                <Download size={20} className="hidden md:block" />
              </button>
            </div>
          </div>
          
          {/* QR Code Modal */}
          {showQR && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={toggleQRCode}>
              <div 
                className="bg-white rounded-xl p-6 max-w-xs w-full text-center"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold mb-4">סרוק לשמירת כרטיס הביקור</h3>
                <div className="bg-white p-2 rounded-lg shadow-inner mx-auto mb-4 flex items-center justify-center">
                  <img src={qrCode} alt="QR Code" className="w-full max-w-[200px] h-auto mx-auto" />
                </div>
                <button
                  onClick={toggleQRCode}
                  className="px-4 py-2 bg-gray-200 rounded-lg text-gray-800 hover:bg-gray-300 transition-colors"
                >
                  סגור
                </button>
              </div>
            </div>
          )}
          
          {/* Contact Information */}
          <div className="px-6 py-6 border-t border-gray-100 animate-fadeIn" style={{animationDelay: "0.7s"}}>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">פרטי קשר</h2>
            <div className="space-y-4">
              {profileUser.phone && (
                <div className="flex items-center animate-fadeIn" style={{animationDelay: "0.8s"}}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 ml-4">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">טלפון</p>
                    <a href={`tel:${profileUser.phone}`} className="text-gray-800 hover:text-blue-600 transition-colors">
                      {profileUser.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {profileUser.email && (
                <div className="flex items-center animate-fadeIn" style={{animationDelay: "0.9s"}}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-green-600 ml-4">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">אימייל</p>
                    <a href={`mailto:${profileUser.email}`} className="text-gray-800 hover:text-green-600 transition-colors">
                      {profileUser.email}
                    </a>
                  </div>
                </div>
              )}
              
              {profileUser.address && (
                <div className="flex items-center animate-fadeIn" style={{animationDelay: "1s"}}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600 ml-4">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">כתובת</p>
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(profileUser.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-800 hover:text-red-600 transition-colors"
                    >
                      {profileUser.address}
                    </a>
                  </div>
                </div>
              )}
              
              {(profileUser.city || profileUser.country) && (
                <div className="flex items-center animate-fadeIn" style={{animationDelay: "1.1s"}}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 text-amber-600 ml-4">
                    <Building size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">עיר/מדינה</p>
                    <p className="text-gray-800">
                      {[profileUser.city, profileUser.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}
              
              {profileUser.area && (
                <div className="flex items-center animate-fadeIn" style={{animationDelay: "1.2s"}}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 ml-4">
                    <MapPinned size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">אזור פעילות</p>
                    <p className="text-gray-800">
                      {getAreaName(profileUser.area)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="px-6 py-6 border-t border-gray-100 animate-fadeIn" style={{animationDelay: "1.3s"}}>
            <div className="flex flex-col space-y-3">
              {/* Share Button (always visible) */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={18} className="ml-2 text-green-500" />
                    הקישור הועתק
                  </>
                ) : (
                  <>
                    <Share2 size={18} className="ml-2" />
                    שתף כרטיס ביקור
                  </>
                )}
              </button>
              
              {/* Conditional buttons based on viewer role and profile user role */}
              {viewer.role === 'supplier' && profileUser.role === 'client' && (
                !viewer.isRelated ? (
                  <button
                    onClick={handleAddClient}
                    disabled={isAddingClient}
                    className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {isAddingClient ? 'מוסיף לקוח...' : 'הוסף לקוח'}
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(`/supplier/${viewer.id}/client/${profileUser._id}`)}
                    className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 shadow-md"
                  >
                    צפה בכרטיס לקוח
                  </button>
                )
              )}
              
              {profileUser.role === 'supplier' && (
                <button
                  onClick={navigateToCatalogPreview}
                  className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 shadow-md flex items-center justify-center"
                >
                  <ExternalLink size={18} className="ml-2" />
                  צפה בקטלוג
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm animate-fadeIn" style={{animationDelay: "1.4s"}}>
          <p>© {new Date().getFullYear()} כרטיס ביקור דיגיטלי</p>
        </div>
      </div>
    </div>
  );
}

// Custom QR Code Icon
function QRCodeIcon({ size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
} 