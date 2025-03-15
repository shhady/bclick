'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useNewUserContext } from '@/app/context/NewUserContext';
export default function AddClientPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [client, setClient] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { newUser } = useNewUserContext();
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
    if (!e.target.value) {
      setClient(null);
      setSearchPerformed(false);
    }
  };

  const handleTypeChange = (e) => {
    setSearchType(e.target.value);
    setSearchPerformed(false);
  };

  const clearSearch = () => {
    setSearchInput('');
    setClient(null);
    setSearchPerformed(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatPhoneForDisplay = (phone) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a search term',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSearching(true);
      setClient(null);

      const searchUrl = `/api/users/search?query=${encodeURIComponent(searchInput)}&searchType=${searchType}`;
      const response = await fetch(searchUrl);
      const data = await response.json();

      setSearchPerformed(true);

      if (response.ok && data.users && data.users.length > 0) {
        setClient(data.users[0]);
      } else {
        setClient(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while searching for the client',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddClient = async () => {
    if (!client) return;

    try {
      const response = await fetch('/api/suppliers/add-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: newUser._id,
          clientId: client._id,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'An error occurred while adding the client',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Add client error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while adding the client',
        variant: 'destructive',
      });
    }
  };

  const navigateToClientCard = () => {
    if (!client || !client._id) {
      toast({
        title: 'Error',
        description: 'Client data is missing',
        variant: 'destructive',
      });
      return;
    }

    router.push(`/supplier/${newUser._id}/client/${client._id}`);
  };

  const resetForm = () => {
    setSearchInput('');
    setClient(null);
    setSearchPerformed(false);
    setIsSuccess(false);
  };
  // Check if client exists in relatedUsers
  const isClientExisting = (clientId) => {
    return newUser?.relatedUsers?.some(
      (relatedUser) => relatedUser.user?._id?.toString() === clientId.toString()
    );  
  };
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">חפש לקוח</h1>

      {!isSuccess ? (
        <>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2">
             
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="חפש לקוח"
                  value={searchInput}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="border rounded-md px-8 py-2 w-full"
                />
                {searchInput && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className={`${isSearching ? 'bg-gray-400' : 'bg-customBlue hover:bg-blue-700'} text-white px-4 py-2 rounded-lg flex-1`}
              >
                {isSearching ? 'מחפש לקוח...' : 'חפש לקוח'}
              </button>

              {client && (
                <button
                  onClick={clearSearch}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  נקה חיפוש
                </button>
              )}
            </div>
          </div>

          {searchPerformed && !client && searchInput && !isSearching && (
            <div className="p-4 border rounded-lg bg-gray-50 text-center">
              <p className="text-gray-600">לא נמצאו תוצאות</p>
              <p className="text-gray-500 text-sm mt-2">
                נסה חיפוש עם מושג אחר או בדק את הכתובות
              </p>
            </div>
          )}

          {client && (
            <div className="p-4 border rounded-lg shadow-lg bg-white">
              <h2 className="text-lg font-semibold mb-4">Client Details</h2>
              <div className="p-4 border rounded-lg shadow-lg bg-white">
              <h2 className="text-lg font-semibold mb-4">פרטי לקוח</h2>
              <div className="space-y-2">
                <p><span className="font-medium">שם:</span> {client.name}</p>
                <p><span className="font-medium">שם עסק:</span> {client.businessName}</p>
                <p><span className="font-medium">אימייל:</span> {client.email}</p>
                <p><span className="font-medium">טלפון:</span> {client.phone}</p>
              </div>
              <div className="mt-6">
                {client._id === newUser._id ? (
                  <p className="text-blue-600 font-medium">זה הכרטיס שלך</p>
                ) : isClientExisting(client._id) ? (
                  <button
                    onClick={navigateToClientCard}
                    className="bg-customBlue text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                  >
                    עבור לכרטיס לקוח
                  </button>
                ) : (
                  <button
                    onClick={handleAddClient}
                    className="bg-customGreen text-white px-6 py-2 rounded-lg hover:bg-green-600"
                  >
                    הוסף לקוח
                  </button>
                )}
              </div>
              </div>
             
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <p className="text-green-600 mb-4">לקוח נוסף בהצלחה!</p>
          <button
            onClick={navigateToClientCard}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            לצפייה בכרטיס לקוח
          </button>
        </div>
      )}
    </div>
  );
}
