'use client';

import React, { useState } from 'react';
import { Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import MyClientOrders from './MyClientOrders';
export default function ClientCard({ client, supplierId }) {
  const [status, setStatus] = useState(client.status);
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const router = useRouter()
    const [openDeletePopup, setOpenDeletePopup] = useState(false);
    const { globalUser, setGlobalUser } = useUserContext(); // Get the globalUser from the context

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
            description: (`${newStatus === "active" ? "  לקוח סטטוס פעיל":"  לקוח סטטוס ללא פעיל" }`),
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
        setOpenDeletePopup(false);
        setGlobalUser((prev) => {
            if (!prev) return prev; // Ensure globalUser exists
            const updatedRelatedUsers = prev.relatedUsers.filter(
              (relatedUser) => relatedUser.user !== client.id
            );
            return { ...prev, relatedUsers: updatedRelatedUsers };
          });
        toast({
            title: (`עדכון רשימת לקוחות`),
            description: 'הלקוח נמחק מהרשימה שלך',
            variant: 'default',
          });
        router.push(`/supplier/${supplierId}/clients`); // Use router.push for navigation
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
        <div className='flex justify-center items-center gap-2'>
            
        <button
        onClick={toggleStatus}
        className={` px-2 py-1 rounded-lg text-white ${
          status === 'active'
            ? 'bg-customRed hover:bg-red-600'
            : 'bg-customGreen hover:bg-customGreen-600'
        }`}
      >
        {status === 'active' ? 'תהפוך ללא פעיל' : 'תהפוך לפעיל'}
      </button>
      <button
      
          onClick={()=>setOpenDeletePopup(true)}
          className="px-4 py-2  hover:bg-customGray text-black rounded-lg"
        >
          <Trash2 />
        </button>
        </div>
        
        
        </div>
        <div className=' p-2 rounded-lg text-lg'>
        <p>
        שם לקוח: {client.name}
      </p>
        
        <p>
        שם עסק: {client.businessName}
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
      <MyClientOrders />
      {openDeletePopup && <div className="z-50 fixed w-full min-h-screen flex justify-center items-center  inset-0 bg-black bg-opacity-50 ">
      <div className="bg-white p-8 rounded-xl">
        <div>{client.name}</div>
              <div>בטוח רוצה למחוק ? </div>
               <div className="w-full flex justify-between items-center mt-8 gap-8">
                <button className="bg-customRed px-4 py-2 rounded-lg text-white" onClick={handleRemove}>מחק</button>
                <button className="bg-gray-500 px-4 py-2 rounded-lg text-white" onClick={()=>setOpenDeletePopup(false)}>ביטול</button>
                </div>
                </div> 
       </div>}
      {/* {message && <p className="text-red-500 mt-4">{message}</p>} */}
    </div>
  );
}
