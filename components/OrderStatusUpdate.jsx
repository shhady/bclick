// 'use client';
// import { useState } from 'react';
// import { FiCheck, FiTruck, FiX } from 'react-icons/fi';

// export default function OrderStatusUpdate({ order, onStatusChange }) {
//   const [isUpdating, setIsUpdating] = useState(false);

//   const handleStatusUpdate = async (newStatus) => {
//     if (isUpdating) return;
    
//     try {
//       setIsUpdating(true);
//       const response = await fetch('/api/orders/update', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           orderId: order._id,
//           status: newStatus,
//           note: `סטטוס הזמנה עודכן ל${newStatus === 'approved' ? 'הושלם' : 
//             newStatus === 'processing' ? 'בטיפול' : 'נדחה'}`
//         })
//       });

//       if (!response.ok) throw new Error('Failed to update order status');
      
//       const data = await response.json();
//       onStatusChange(data.order);
//     } catch (error) {
//       console.error('Error updating order status:', error);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   if (order.status !== 'pending') return null;

//   return (
//     <div className="flex items-center gap-2">
//       <button
//         onClick={() => handleStatusUpdate('processing')}
//         disabled={isUpdating}
//         className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
//       >
//         <FiTruck className="w-4 h-4" />
//         בטיפול
//       </button>
//       <button
//         onClick={() => handleStatusUpdate('approved')}
//         disabled={isUpdating}
//         className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
//       >
//         <FiCheck className="w-4 h-4" />
//         אישור
//       </button>
//       <button
//         onClick={() => handleStatusUpdate('rejected')}
//         disabled={isUpdating}
//         className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
//       >
//         <FiX className="w-4 h-4" />
//         דחייה
//       </button>
//     </div>
//   );
// } 