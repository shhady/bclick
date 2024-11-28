'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Loader from '@/components/loader/Loader';

export default function ClientDetailsPage() {
  const pathname = usePathname();
  const { globalUser, setGlobalUser } = useUserContext(); // Access context
  const [clientData, setClientData] = useState(null);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');


  // Extract userId from the URL
  const userId = pathname.split('/').pop();

  // Fetch client data on component load
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setClientData(data);

          // Get the current status from the globalUser
          const relatedUser = globalUser?.relatedUsers?.find((rel) => rel.user === userId);
          setStatus(relatedUser?.status || 'inactive'); // Default to inactive
        } else {
          setMessage('Failed to fetch client data.');
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
        setMessage('An error occurred while fetching client data.');
      }
    };

    if (userId && globalUser) {
      fetchClientData();
    }
  }, [userId, globalUser]);

  // Toggle status function
  const toggleStatus = async () => {
    if (!globalUser) {
      setMessage('Supplier information not available.');
      return;
    }

    try {
      const newStatus = status === 'active' ? 'inactive' : 'active';

      const response = await fetch(`/api/suppliers/toggle-client-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: globalUser._id,
          clientId: userId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Optimistically update local state
        setStatus(newStatus);
        setMessage(`Status updated to ${newStatus}`);

        // Update the globalUser context
        setGlobalUser((prev) => {
          const updatedRelatedUsers = prev.relatedUsers.map((rel) =>
            rel.user === userId ? { ...rel, status: newStatus } : rel
          );
          return { ...prev, relatedUsers: updatedRelatedUsers };
        });
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to update status.');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      setMessage('An error occurred while updating status.');
    }
  };

  if (!clientData) {
    return <div><Loader/></div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Client Details</h1>
      <div className="p-4 border rounded-lg shadow-lg bg-white">
        <p><strong>Name:</strong> {clientData.name}</p>
        <p><strong>Email:</strong> {clientData.email}</p>
        <p><strong>Phone:</strong> {clientData.phone}</p>
        <p><strong>Business Name:</strong> {clientData.businessName}</p>
        <p><strong>Status:</strong> {status}</p>
        <button
          onClick={toggleStatus}
          className={`mt-4 px-4 py-2 rounded-lg text-white ${
            status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {status === 'active' ? 'Set to Inactive' : 'Set to Active'}
        </button>
      </div>
      {message && <p className="text-red-500 mt-4">{message}</p>}
    </div>
  );
}
