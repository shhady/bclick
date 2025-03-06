// 'use client';

// import { useState, useEffect } from 'react';
// import { usePathname } from 'next/navigation';
// import Loader from '@/components/loader/Loader';

// export default function UserDetailsPage() {
//   const pathname = usePathname();
//   const userId = pathname.split('/').pop(); // Extract user ID from URL
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   // Fetch user data
//   useEffect(() => {
//     const fetchUser = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch(`/api/users/${userId}`);
//         if (response.ok) {
//           const data = await response.json();
//           setUserData(data);
//         } else {
//           throw new Error('Failed to fetch user');
//         }
//       } catch (error) {
//         setMessage('Error fetching user details.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, [userId]);

//   // Handle role toggle
//   const handleToggleRole = async () => {
//     if (!userData) {
//       setMessage('User data is not available.');
//       return;
//     }

//     const newRole = userData.role === 'client' ? 'supplier' : 'client';

//     try {
//       const response = await fetch('/api/users/update-user-role', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId: userData._id, role: newRole }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || 'Failed to update role');
//       }

//       // Update user role in the state
//       const updatedUser = await response.json();
//       setUserData((prev) => ({ ...prev, role: updatedUser.user.role }));
//       setMessage(`User role updated successfully to ${updatedUser.user.role}`);
//     } catch (error) {
//       console.error('Error updating user role:', error);
//       setMessage(error.message || 'An error occurred while updating the role.');
//     }
//   };
//   // Handle user deletion
//   const handleDeleteUser = async () => {
//     try {
//       const response = await fetch(`/api/users/delete-user`, {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ clerkId: userId }),
//       });

//       if (response.ok) {
//         setMessage('User deleted successfully.');
//         setUserData(null); // Clear user data after deletion
//       } else {
//         throw new Error('Failed to delete user');
//       }
//     } catch (error) {
//       setMessage('Error deleting user.');
//     }
//   };

//   if (loading) return <Loader />;
//   if (!userData) return <p>{message || 'No user found.'}</p>;

//   return (
//     <div className="p-4 max-w-lg mx-auto bg-white shadow-md rounded-md">
//       <h1 className="text-xl font-bold mb-4">User Details</h1>
//       <p><strong>Name:</strong> {userData.name}</p>
//       <p><strong>Phone:</strong> {userData.phone}</p>
//       <p><strong>Email:</strong> {userData.email}</p>
//       <p><strong>Role:</strong> {userData.role}</p>

//       <div className="mt-4 flex justify-between">
//         <button
//           onClick={handleToggleRole}
//           className={`px-4 py-2 rounded ${
//             userData.role === 'client'
//               ? 'bg-customGreen text-white hover:bg-customGreen-600'
//               : 'bg-customBlue text-white hover:bg-blue-600'
//           }`}
//         >
//           {userData.role === 'client' ? 'Convert to Supplier' : 'Convert to Client'}
//         </button>
//         <button
//           onClick={handleDeleteUser}
//           className="px-4 py-2 rounded bg-customRed text-white hover:bg-red-600"
//         >
//           Delete User
//         </button>
//       </div>
//       {message && <p className="text-center text-green-500 mt-4">{message}</p>}
//     </div>
//   );
// }
