// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import Loader from '@/components/loader/Loader';
// import Link from 'next/link';

// const AllUsers = () => {
//   const [users, setUsers] = useState([]);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);
//   const [filter, setFilter] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Fetch users with filtering and pagination
//   const fetchUsers = useCallback(async () => {
//     setLoading(true);
//     setError(null); // Reset error before fetching

//     try {
//       const response = await fetch(`/api/users/get-users?page=${page}&limit=10&filter=${filter}`);
//       if (response.ok) {
//         const data = await response.json();
//         setUsers(data.users);
//         setTotalUsers(data.totalUsers);
//         setTotalPages(data.totalPages);
//       } else {
//         throw new Error('Failed to fetch users');
//       }
//     } catch (error) {
//       setError('Failed to fetch users or no users available');
//       setUsers([]); // Ensure users array is empty in case of an error
//     } finally {
//       setLoading(false);
//     }
//   }, [page, filter]); // Include dependencies

//   useEffect(() => {
//     fetchUsers();
//   }, [fetchUsers]); // Call fetchUsers when dependencies change

//   // Handle filter input
//   const handleFilterChange = (e) => {
//     setFilter(e.target.value);
//     setPage(1); // Reset to the first page on new filter
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4 text-center">כל הלקוחות</h1>

//       {/* Filter Input */}
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="Search by name, email, or phone"
//           value={filter}
//           onChange={handleFilterChange}
//           className="w-full p-2 border border-gray-300 rounded"
//         />
//       </div>

//       {/* Users Table or Error/Empty Message */}
//       {loading ? (
//         <Loader />
//       ) : error ? (
//         <p className="text-center text-red-500">{error}</p>
//       ) : users.length === 0 ? (
//         <p className="text-center text-gray-500">No users found.</p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full table-auto border-collapse border border-gray-200">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="border px-4 py-2">שם</th>
//                 <th className="border px-4 py-2">טלפון</th>
//                 <th className="border px-4 py-2">תפקיד</th>
//                 <th className="border px-4 py-2">פעולה</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.map((user) => (
//                 <tr key={user.clerkId} className="text-center">
//                   <td className="border px-4 py-2">{user.name}</td>
//                   <td className="border px-4 py-2">{user.phone}</td>
//                   <td className="border px-4 py-2">{user.role}</td>
//                   <td className="border px-4 py-2">
//                     <Link href={`/admin/user-details/${user._id}`}>
//                       <button className="bg-customBlue text-white px-4 py-1 rounded hover:bg-blue-600">
//                         הצג
//                       </button>
//                     </Link>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Pagination Controls */}
//       {users.length > 0 && (
//         <div className="flex justify-between items-center mt-4">
//           <button
//             onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
//             disabled={page === 1}
//             className={`px-4 py-2 rounded ${
//               page === 1 ? 'bg-gray-300' : 'bg-customBlue text-white hover:bg-blue-600'
//             }`}
//           >
//             קודם
//           </button>
//           <p>
//             Page {page} of {totalPages}
//           </p>
//           <button
//             onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
//             disabled={page === totalPages}
//             className={`px-4 py-2 rounded ${
//               page === totalPages ? 'bg-gray-300' : 'bg-customBlue text-white hover:bg-blue-600'
//             }`}
//           >
//             הבא
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AllUsers;
