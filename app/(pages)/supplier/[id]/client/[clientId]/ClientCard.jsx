'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useNewUserContext } from '@/app/context/NewUserContext';
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
    const { newUser, setNewUser } = useNewUserContext(); // Get the newUser from the context

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
        
        // Update the newUser context to reflect the new status
        setNewUser((prev) => {
          if (!prev) return prev;
          
      
          
          const updatedRelatedUsers = prev.relatedUsers.map((relatedUser) => {
            // Log each related user to see the structure
            
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
        
        // Update the newUser context correctly
        setNewUser((prev) => {
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
      
      <div className="p-4 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="no-print flex justify-between items-center mb-6">
            <div className="text-xl sm:text-2xl font-bold text-gray-800">כרטיס לקוח</div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-300 flex items-center gap-2 border border-gray-200 shadow-sm hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-customBlue" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              הדפס
            </button>
          </div>

          <div className='flex flex-row justify-end items-end sm:items-center mb-6 border-b border-gray-200 pb-4'>
            <div className='flex flex-col gap-1'>
              {/* <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>פרטי לקוח</h2> */}
              <button
                onClick={toggleStatus}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 shadow-sm hover:shadow-md ${
                  status === 'active'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {status === 'active' ? 'תהפוך ללא פעיל' : 'תהפוך לפעיל'}
              </button>
            </div>
            <div className='flex items-center gap-3'>
              {status === 'inactive' && (
                <button
                  onClick={() => setOpenDeletePopup(true)}
                  className="px-4 mr-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  מחק לקוח
                </button>
              )}
            </div>
          </div>

          {/* Print content */}
          <div className="print-content">
            <div className='rounded-xl bg-gray-50 p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-100'>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg className="h-5 w-5 text-customBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">שם לקוח</p>
                  <p className="font-medium text-gray-800">{client.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg className="h-5 w-5 text-customBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">שם עסק</p>
                  <p className="font-medium text-gray-800">{client.businessName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg className="h-5 w-5 text-customBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">מספר לקוח</p>
                  <p className="font-medium text-gray-800">
                    <span className="bg-blue-100 text-customBlue py-1 px-3 rounded-full text-sm">
                      {client.clientNumber}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg className="h-5 w-5 text-customBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">טלפון</p>
                  <p className="font-medium text-gray-800 dir-ltr text-left">{client.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg className="h-5 w-5 text-customBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">סטטוס</p>
                  <p className="font-medium">
                    <span className={`py-1 px-3 rounded-full text-sm ${
                      status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {status === "active" ? "פעיל" : "לא פעיל"}
                    </span>
                  </p>
                </div>
              </div>
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
      </div>
    </>
  );
}
