'use client';
import { useState, useEffect } from 'react';
import UserDetails from './UserDetails';
import Flag from 'react-flagkit';
function useFetchUsers(page, limit) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseUrl}/api/users/get-users?page=${page}&limit=${limit}`);
        if (response.ok) {
          const { users, totalPages } = await response.json();
          setData(users);
          setTotalPages(totalPages);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, limit]);

  return { data, loading, totalPages, error };
}

export default function AllUsers() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // State to track selected user
  const [users, setUsers] = useState([]); // State to store all users
  const [filteredUsers, setFilteredUsers] = useState([]); // State to store filtered users
  const limit = 10; // Items per page

  const { data, loading, totalPages, error } = useFetchUsers(page, limit);

  useEffect(() => {
    setUsers(data); // Update users state when data changes
  }, [data]);

  useEffect(() => {
    // Filter users based on the search input
    if (filter) {
      const lowercasedFilter = filter.toLowerCase();
      setFilteredUsers(users.filter(user =>
        user.name.toLowerCase().includes(lowercasedFilter) ||
        user.email.toLowerCase().includes(lowercasedFilter) ||
        user.phone.includes(lowercasedFilter)
      ));
    } else {
      setFilteredUsers(users);
    }
  }, [filter, users]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(prevPage => prevPage - 1);
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    // setPage(1); // Reset to first page on filter change
  };

  const handleUserClick = (user) => {
    setSelectedUser(user); // Set selected user ID
  };

  const handleBackToUsers = () => {
    setSelectedUser(null); // Clear selected user ID to go back
  };

  if (selectedUser) {
    return <UserDetails user={selectedUser} onBack={handleBackToUsers} />;
  }

  if (loading) {
    return (
      <div className="text-center min-h-[80vh] flex flex-col justify-center items-center">
        {/* Loading Skeleton */}
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center min-h-[80vh] flex flex-col justify-center items-center">
      <p className="text-red-500">Error: {error}</p>
    </div>;
  }

  return (
    <div className="bg-white text-black min-h-screen p-4">
      <div className="text-center flex flex-col gap-4 max-w-screen-2xl m-auto">
        <h1 className="text-4xl">جميع المستخدمين</h1>
        <div className="border-b-2 md:w-80 w-40 mx-auto"></div>
        {/* <div className="my-4 w-full md:w-1/2 mx-auto">
          <input
            type="text"
            placeholder="بحث..."
            value={filter}
            onChange={handleFilterChange}
            className="form-input w-full p-2 border rounded"
          />
        </div> */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border hidden lg:table-cell">Email</th>
                <th className="py-2 px-4 border">الاسم</th>
                <th className="py-2 px-4 border">الهاتف</th>
                <th className="py-2 px-4 border hidden lg:table-cell">ميزانية</th>
                <th className="py-2 px-4 border hidden lg:table-cell">جاهز</th>
                <th className="py-2 px-4 border hidden lg:table-cell">كيف</th>
                <th className="py-2 px-4 border hidden lg:table-cell">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr 
                  key={user._id} 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleUserClick(user)}      
                >
                  <td className="py-2 px-4 border hidden lg:table-cell">{user.email}</td>
                  <td className="py-2 px-4 border">{user.name}</td>
                  <td className="py-2 px-4 border flex flex-col lg:flex-row justify-center items-center">{user.countryFlagCode ? <Flag country={user.countryFlagCode} /> : ""}{user.phone}</td>
                  <td className="py-2 px-4 border hidden lg:table-cell">{user.budget}</td>
                  <td className="py-2 px-4 border hidden lg:table-cell">{user.ready}</td>
                  <td className="py-2 px-4 border hidden lg:table-cell">{user.how}</td>
                  <td className="py-2 px-4 border hidden lg:table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between mt-4">
          <button onClick={handlePreviousPage} disabled={page === 1} className="bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50">السابق</button>
          <span>صفحه {page} من {totalPages}</span>
          <button onClick={handleNextPage} disabled={page === totalPages} className="bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50">التالي</button>
        </div>
      </div>
    </div>
  );
}
