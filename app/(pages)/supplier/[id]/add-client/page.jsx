'use client';

import React, { useState } from 'react';
import { useUserContext } from '@/app/context/UserContext';

export default function AddClientPage() {
  const [searchInput, setSearchInput] = useState('');
  const [client, setClient] = useState(null);
  const [message, setMessage] = useState('');

  const { globalUser, setGlobalUser } = useUserContext(); // Get the globalUser from the context

  // Function to check if the client already exists in relatedUsers
  const isClientExisting = (clientId) => {
    return globalUser?.relatedUsers?.some((relatedUser) => relatedUser?.user?.toString() === clientId);
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      setMessage('Please enter valid client information');
      return;
    }

    try {
      const response = await fetch(`/api/users/find-client?query=${searchInput}`);
      if (response.ok) {
        const data = await response.json();
        setClient(data);
        setMessage('');
      } else {
        const error = await response.json();
        setClient(null);
        setMessage(error.error || 'Client not found');
      }
    } catch (error) {
      setClient(null);
      setMessage('An error occurred while searching for the client.');
      console.error(error);
    }
  };

  const handleAddClient = async () => {
    if (!client) return;

    try {
      const response = await fetch('/api/suppliers/add-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: globalUser?._id, // Use the globalUser ID from context
          clientId: client._id, // Ensure the correct ID is sent
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGlobalUser((prev) => ({
          ...prev,
          relatedUsers: [
            ...prev.relatedUsers,
            { user: client._id, status: 'active' }, // Add the new client with active status
          ],
        }));
        setMessage('Client successfully added as active!');
        setClient(null);
        setSearchInput('');
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to add client');
      }
    } catch (error) {
      setMessage('An error occurred while adding the client.');
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">תחפש לקוח</h1>

      {/* Search Input */}
      <div className="flex-col items-center space-x-4 mb-6">
        <input
          type="text"
          placeholder="תחפש לפי שם, שם עסק, אימייל, מספר טלפון"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border rounded-md px-4 py-2 w-full mb-4"
        />
        <button
          onClick={handleSearch}
          className="bg-customBlue text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full"
        >
          מצא לקוח
        </button>
      </div>

      {/* Search Results */}
      {message && <p className="text-red-500 mb-4">{message}</p>}
      {client && (
        <div className="p-4 border rounded-lg shadow-lg bg-white mb-6">
          <h2 className="text-lg font-semibold mb-2">פרטי לקוח</h2>
          <p><strong>שם:</strong> {client.name}</p>
          <p><strong>שם עסק:</strong> {client.businessName}</p>
          <p><strong>אימייל:</strong> {client.email}</p>
          <p><strong>טלפון:</strong> {client.phone}</p>
          {/* Check for self, existing client, or new client */}
          {client?._id === globalUser?._id ? (
            <p className="text-blue-600 font-semibold mt-4">הכרטיס שלך</p>
          ) : isClientExisting(client._id) ? (
            <p className="text-green-600 font-semibold mt-4">לקוח קיים</p>
          ) : (
            <button
              onClick={handleAddClient}
              className="bg-customGreen text-white px-4 py-2 rounded-lg hover:bg-customGreen-600 mt-4"
            >
              הוסף לקוח
            </button>
          )}
        </div>
      )}
    </div>
  );
}
