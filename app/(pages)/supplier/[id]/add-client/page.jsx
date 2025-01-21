'use client';

import React, { useState } from 'react';
import { useUserContext } from '@/app/context/UserContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function AddClientPage() {
  const [searchInput, setSearchInput] = useState('');
  const [client, setClient] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { globalUser, setGlobalUser } = useUserContext();
  const router = useRouter();
  const { toast } = useToast();

  // Check if client exists in relatedUsers
  const isClientExisting = (clientId) => {
    return globalUser?.relatedUsers?.some(
      (relatedUser) => relatedUser.user?._id?.toString() === clientId.toString()
    );
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא הכנס מידע לחיפוש",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/users/find-client?query=${searchInput}`);
      if (response.ok) {
        const data = await response.json();
        setClient(data);
      } else {
        const error = await response.json();
        toast({
          title: "שגיאה",
          description: error.error || "לקוח לא נמצא",
          variant: "destructive",
        });
        setClient(null);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בחיפוש הלקוח",
        variant: "destructive",
      });
    }
  };

  const handleAddClient = async () => {
    if (!client) return;

    try {
      const response = await fetch('/api/suppliers/add-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: globalUser?._id,
          clientId: client._id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update global user context
        setGlobalUser((prev) => ({
          ...prev,
          relatedUsers: [
            ...prev.relatedUsers,
            { user: client, status: 'active' },
          ],
        }));
        setIsSuccess(true);
        toast({
          title: "הצלחה",
          description: "הלקוח נוסף בהצלחה!",
          variant: "default",
        });
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
    }
  };

  const navigateToClientCard = () => {
    router.push(`/supplier/${globalUser._id}/client/${client._id}`);
  };

  const resetForm = () => {
    setClient(null);
    setSearchInput('');
    setIsSuccess(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">חיפוש לקוח</h1>

      {!isSuccess && (
        <>
          <div className="flex flex-col gap-4 mb-6">
            <input
              type="text"
              placeholder="חפש לפי שם, שם עסק, אימייל, או מספר טלפון"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border rounded-md px-4 py-2"
            />
            <button
              onClick={handleSearch}
              className="bg-customBlue text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              חפש לקוח
            </button>
          </div>

          {client && (
            <div className="p-4 border rounded-lg shadow-lg bg-white">
              <h2 className="text-lg font-semibold mb-4">פרטי לקוח</h2>
              <div className="space-y-2">
                <p><span className="font-medium">שם:</span> {client.name}</p>
                <p><span className="font-medium">שם עסק:</span> {client.businessName}</p>
                <p><span className="font-medium">אימייל:</span> {client.email}</p>
                <p><span className="font-medium">טלפון:</span> {client.phone}</p>
              </div>

              <div className="mt-6">
                {client._id === globalUser._id ? (
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
          )}
        </>
      )}

      {isSuccess && (
        <div className="p-6 border rounded-lg shadow-lg bg-white">
          <h2 className="text-xl font-semibold text-green-600 mb-4">
            הלקוח נוסף בהצלחה!
          </h2>
          <div className="flex gap-4 mt-6">
            <button
              onClick={navigateToClientCard}
              className="bg-customBlue text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              עבור לכרטיס לקוח
            </button>
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              הוסף לקוח נוסף
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
