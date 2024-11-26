'use client';
import { useState } from 'react';
import UserDetails from './UserDetails'; // Ensure this path is correct

export default function AllUsersClient({ initialData }) {
  const [data] = useState(initialData);
  const [filter, setFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = data.filter(user => user.name.toLowerCase().includes(filter.toLowerCase()));

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  if (selectedUser) {
    return <UserDetails user={selectedUser} onBack={handleBack} />;
  }

  return (
    <div className="bg-white text-black min-h-screen p-4">
      <div className="text-center flex flex-col gap-4 max-w-screen-2xl m-auto">
        <h1 className="text-4xl">جميع المستخدمين</h1>
        <div className="border-b-2 md:w-80 w-40 mx-auto"></div>
        <div className="my-4 w-full md:w-1/2 mx-auto">
          <input
            type="text"
            placeholder="بحث..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input w-full p-2 border rounded"
          />
        </div>
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
                  onClick={() => handleUserClick(user)} 
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <td className="py-2 px-4 border hidden lg:table-cell">{user.email}</td>
                  <td className="py-2 px-4 border">{user.name}</td>
                  <td className="py-2 px-4 border">{user.phone}</td>
                  <td className="py-2 px-4 border hidden lg:table-cell">{user.budget}</td>
                  <td className="py-2 px-4 border hidden lg:table-cell">{user.ready}</td>
                  <td className="py-2 px-4 border hidden lg:table-cell">{user.how}</td>
                  <td className="py-2 px-4 border hidden lg:table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}