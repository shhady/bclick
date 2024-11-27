'use client';

import React, { useState } from 'react';
import { Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export default function ClientCard({ client, supplierId }) {
  const [status, setStatus] = useState(client.status);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const toggleStatus = async () => {
    try {
      const newStatus = status === 'active' ? 'inactive' : 'active';

      const response = await fetch('/api/suppliers/toggle-client-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          clientId: client.id,
          status: newStatus,
        }),
      });

      if (response.ok) {
        setStatus(newStatus);
        toast({
            title: "לקוח סטטוס עודכן",
            description: (`${newStatus === "active" ? "  לקוח סטטוס פעיל":"  לקוח סטטוס לא לפעיל" }`),
            variant: 'default',
          });
        // setMessage(`Status updated to ${newStatus}.`);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to update status.');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      setMessage('An error occurred while updating status.');
    }
  };
  const handleRemove = async () => {
    try {
      const response = await fetch('/api/suppliers/remove-related-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          clientId: client.id,
        }),
      });
  
      if (response.ok) {
        setMessage('Client removed successfully.');
        // onRemove(client.id); // Notify parent to update UI
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to remove client.');
      }
    } catch (error) {
      console.error('Error removing client:', error);
      setMessage('An error occurred while removing the client.');
    }
  };
  return (
    <div className="p-4 border rounded-lg  bg-white">
        
        <div className='flex justify-between items-center my-4'>
        <h2 className='text-2xl'>כרטיס לקוח</h2>
        <div className='flex justify-center items-center'>
            
        <button
        onClick={toggleStatus}
        className={` px-2 py-1 rounded-lg text-white ${
          status === 'active'
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {status === 'active' ? 'תהפוך ללא פעיל' : 'תהפוך לפעיל'}
      </button>
      <button
          onClick={handleRemove}
          className="px-4 py-2  hover:bg-gray-600 text-black rounded-lg"
        >
          <Trash2 />
        </button>
        </div>
        
        
        </div>
        <div className='shadow-2xl p-2 rounded-lg text-lg'>

        
        <p>
        שם לקוח: {client.businessName}
      </p>
      <p>
        מספר לקוח: {client.clientNumber}
      </p>
      {/* <p>
        Name: {client.name}
      </p>
      <p>
        Email: {client.email}
      </p> */}
      <p>
        טלפון: {client.phone}
      </p>
      
      <p>
        סטטוס: {status === "active" ? "פעיל" : "לא פעיל"}
      </p>
      </div>
      {/* {message && <p className="text-red-500 mt-4">{message}</p>} */}
    </div>
  );
}
