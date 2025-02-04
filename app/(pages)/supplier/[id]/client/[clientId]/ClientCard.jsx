'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import MyClientOrders from './MyClientOrders';

// Update the print styles at the top
const printStyles = `
  @media print {
    /* Hide everything by default */
    body * {
      visibility: hidden;
    }
    
    /* Only show the specific order content */
    .print-content, .print-content * {
      visibility: visible;
    }
    
    /* Hide all buttons and navigation */
    button, nav {
      display: none !important;
    }
    
    /* Center the content and adjust paper margins */
    .print-content {
      visibility: visible;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      margin: 20px auto;
    }

    /* Ensure table arrows and content are visible */
    .print-content svg,
    .print-content img {
      visibility: visible !important;
    }

    /* Ensure proper table layout */
    .print-content table {
      width: 100%;
      border-collapse: collapse;
    }

    /* Remove background colors and adjust text for better printing */
    .print-content * {
      background-color: transparent !important;
      color: black !important;
    }
  }
`;

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
        
        // Update the globalUser context to reflect the new status
        setGlobalUser((prev) => {
          if (!prev) return prev;
          
          // Log the structure to debug
          console.log('Previous state:', prev);
          console.log('Client ID to update:', client.id);
          
          const updatedRelatedUsers = prev.relatedUsers.map((relatedUser) => {
            // Log each related user to see the structure
            console.log('Checking relatedUser:', relatedUser);
            
            // Check both possible paths for the ID
            if (relatedUser.user._id === client.id || relatedUser.user.id === client.id) {
              return {
                ...relatedUser,
                user: {
                  ...relatedUser.user,
                  status: newStatus
                },
                status: newStatus
              };
            }
            return relatedUser;
          });
          
          // Log the updated state
          console.log('Updated state:', {
            ...prev,
            relatedUsers: updatedRelatedUsers
          });
          
          return {
            ...prev,
            relatedUsers: updatedRelatedUsers
          };
        });

        toast({
            title: "לקוח סטטוס עודכן",
            description: (`${newStatus === "active" ? "  לקוח סטטוס פעיל":"  לקוח סטטוס ללא פעיל" }`),
            variant: 'default',
        });
        
        // Force a router refresh to update the UI
        router.refresh();
        
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
        setOpenDeletePopup(false);
        
        // Update the globalUser context correctly
        setGlobalUser((prev) => {
          if (!prev) return prev;
          
          // Filter out the removed client using proper comparison
          const updatedRelatedUsers = prev.relatedUsers.filter(
            (relatedUser) => relatedUser.user._id !== client.id
          );
          
          return {
            ...prev,
            relatedUsers: updatedRelatedUsers
          };
        });

        toast({
          title: "עדכון רשימת לקוחות",
          description: 'הלקוח נמחק מהרשימה שלך',
          variant: 'default',
        });
        
        router.push(`/supplier/${supplierId}/clients`);
      } else {
        const error = await response.json();
        toast({
          title: "שגיאה",
          description: error.error || 'שגיאה במחיקת הלקוח',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error removing client:', error);
      toast({
        title: "שגיאה",
        description: 'אירעה שגיאה במחיקת הלקוח',
        variant: 'destructive',
      });
    }
  };
  return (
    <>
      <style>{printStyles}</style>
      
      <div className="p-4 border rounded-lg my-4 bg-white">
        <div className="no-print flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm"
          >
            <ArrowRight />
            חזור
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm mr-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            הדפס
          </button>
        </div>

        <div className='flex justify-between items-center my-4'>
          <h2 className='text-2xl'>כרטיס לקוח</h2>
          <div className='flex justify-center items-center gap-2'>
            <button
              onClick={toggleStatus}
              className={`px-2 py-1 rounded-lg text-white ${
                status === 'active'
                  ? 'bg-customRed hover:bg-red-600'
                  : 'bg-customGreen hover:bg-customGreen-600'
              }`}
            >
              {status === 'active' ? 'תהפוך ללא פעיל' : 'תהפוך לפעיל'}
            </button>
            {status === 'inactive' && (
              <button
                onClick={() => setOpenDeletePopup(true)}
                className="px-2 py-1 hover:bg-customGray text-white rounded-lg bg-red-500"
              >
                מחק לקוח
              </button>
            )}
          </div>
        </div>

        {/* Print content */}
        <div className="print-content">
          <div className='p-2 rounded-lg text-lg'>
            <p>שם לקוח: {client.name}</p>
            <p>שם עסק: {client.businessName}</p>
            <p>מספר לקוח: {client.clientNumber}</p>
            <p>טלפון: {client.phone}</p>
            <p>סטטוס: {status === "active" ? "פעיל" : "לא פעיל"}</p>
          </div>
          <MyClientOrders />
        </div>

        {/* Delete popup */}
        {openDeletePopup && (
          <div className="no-print z-50 fixed w-full min-h-screen flex justify-center items-center inset-0 bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-xl">
              <div>{client.name}</div>
              <div>בטוח רוצה למחוק ? </div>
              <div className="w-full flex justify-between items-center mt-8 gap-8">
                <button className="bg-customRed px-4 py-2 rounded-lg text-white" onClick={handleRemove}>מחק</button>
                <button className="bg-gray-500 px-4 py-2 rounded-lg text-white" onClick={() => setOpenDeletePopup(false)}>ביטול</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
