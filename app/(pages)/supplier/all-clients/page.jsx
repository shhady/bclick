'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserContext } from "@/app/context/UserContext";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // Default filter: active clients
  const { globalUser, loading, error } = useUserContext();

  console.log(globalUser);
  
  // Fetch clients when globalUser is available
  useEffect(() => {
    if (!globalUser) return; // Wait for globalUser to load

    const fetchClients = async () => {
      try {
        const response = await fetch(`/api/suppliers/clients/${globalUser._id}`);
        if (response.ok) {
          const data = await response.json();
          setClients(data);
          setFilteredClients(data.filter((client) => client.status === 'active')); // Apply filter
        } else {
          console.error("Failed to fetch clients");
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, [globalUser]);

  // Handle search query
  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query.toLowerCase()) ||
        client.businessName.toLowerCase().includes(query.toLowerCase()) ||
        client.phone?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredClients(filtered.filter((client) => client.status === statusFilter)); // Apply status filter to search results
  };

  // Handle status filter
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    const filtered = clients.filter((client) => client.status === status);
    setFilteredClients(
      filtered.filter((client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">לקוחות</h2>
       <Link href='/supplier/add-client'> <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          הוסף לקוח +
        </button>
        </Link>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 mb-4">
        <input
          type="text"
          placeholder="חפש"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="border rounded-md px-4 py-2 w-full"
        />
        <div className="flex gap-4">
          <button
            className={`flex-1 px-4 py-2 rounded-md ${
              statusFilter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => handleStatusChange('active')}
          >
            פעיל
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded-md ${
              statusFilter === 'inactive' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => handleStatusChange('inactive')}
          >
            לא פעיל
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border border-gray-300 text-right">מספר לקוח</th>
              <th className="p-3 border border-gray-300 text-right">עסק</th>
              <th className="p-3 border border-gray-300 text-right">מספר הזמנות</th>
              {/* <th className="p-3 border border-gray-300 text-right">סטטוס</th> */}
              <th className="p-3 border border-gray-300 text-right">פעולה</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client, i) => (
              <tr key={client.id} className="text-right">
                <td className="p-3 border border-gray-300">{client.clientNumber}</td>
                <td className="p-3 border border-gray-300">{client.businessName}</td>
                <td className="p-3 border border-gray-300">{client.ordersCount}</td>
                {/* <td className="p-3 border border-gray-300">
                  {client.status === 'active' ? 'פעיל' : 'לא פעיל'}
                </td> */}
                <td className="p-3 border border-gray-300">
                  <Link
                    href={`/supplier/client-details/${client.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    הצג
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
