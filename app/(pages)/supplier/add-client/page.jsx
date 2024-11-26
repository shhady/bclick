'use client';

import React, { useState } from 'react';
import { useUserContext } from '@/app/context/UserContext';

export default function AddClientPage() {
  const [searchInput, setSearchInput] = useState('');
  const [client, setClient] = useState(null);
  const [message, setMessage] = useState('');

  const { globalUser } = useUserContext(); // Get the globalUser from the context

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
      <h1 className="text-xl font-semibold mb-4">Search and Add Client</h1>

      {/* Search Input */}
      <div className="flex-col items-center space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, business name, email, or phone"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border rounded-md px-4 py-2 w-full mb-4"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full"
        >
          Find Client
        </button>
      </div>

      {/* Search Results */}
      {message && <p className="text-red-500 mb-4">{message}</p>}
      {client && (
        <div className="p-4 border rounded-lg shadow-lg bg-white mb-6">
          <h2 className="text-lg font-semibold mb-2">Client Details</h2>
          <p><strong>Name:</strong> {client.name}</p>
          <p><strong>Business Name:</strong> {client.businessName}</p>
          <p><strong>Email:</strong> {client.email}</p>
          <p><strong>Phone:</strong> {client.phone}</p>
          <button
            onClick={handleAddClient}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mt-4"
          >
            Add Client
          </button>
        </div>
      )}
    </div>
  );
}
