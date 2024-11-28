'use client';

import Link from 'next/link';
import React, { useState } from 'react';

export default function Clients({ clients,supplierId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(null); // Sort by orders count
  const [statusFilter, setStatusFilter] = useState('active'); // Filter by status ('active' or 'inactive')

  // Filter and sort clients based on user input
  const filteredClients = clients
    .filter((client) => {
      // Filter by search query
      const matchesQuery =
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.clientNumber.toString().includes(searchQuery);

      // Filter by status
      const matchesStatus =
        !statusFilter || client.status === statusFilter;

      return matchesQuery && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by orders count (if selected)
      if (sortBy === 'orders') {
        return b.ordersCount - a.ordersCount; // Descending order
      }
      return 0; // No sorting
    });

  return (
    <div className="p-4 mb-24">
        <div className="sticky md:top-16 top-0 bg-white w-full px-4 pt-6 pb-1">
          <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">לקוחות</h2>
       <Link href='/supplier/add-client'> <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          הוסף לקוח +
        </button>
        </Link>
      </div>
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder=" חפש לפי טלפון, מספר לקוח, אימייל, שם עסק"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Filters and Sorting */}
      <div className="flex justify-between mb-4">
        {/* Status Filter */}
        <div className="flex w-full gap-1">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-md w-full ${
              statusFilter === 'active'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            פעיל
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-4 py-2 rounded-md w-full ${
              statusFilter === 'inactive'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            לא פעיל
          </button>
          {/* <button
            onClick={() => setStatusFilter(null)}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700"
          >
            נקה סינון
          </button> */}
        </div>

        {/* Sort By Orders */}
        {/* <button
          onClick={() => setSortBy(sortBy === 'orders' ? null : 'orders')}
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-700"
        >
          {sortBy === 'orders' ? 'נקה מיון' : 'מיין לפי הזמנות'}
        </button> */}
       
      </div>
      <div className='grid grid-cols-4 pt-4 pb-2 border-b-2 border-gray-700 px-2'>
        <div className="text-start">מספר לקוח</div>
        <div className="text-center">עסק</div>
        <div className="text-center">מספר הזמנות</div>
        <div className="text-center"></div>
        </div>
      </div>
      {/* Clients Table */}
      <div className="overflow-x-auto">
       
        {filteredClients.map((client,i) => (

             <div className='grid grid-cols-4 border-b-2 border-[#D9D9D9] items-center p-2' key={i}>
            <div className="text-start">{client.clientNumber}</div>
            <div className="text-center">{client.businessName}</div>
            <div className="text-center">{client.ordersCount}</div>
            <div className="text-center"> <Link
             href={`/supplier/${supplierId}/client/${client.id}`}
             className="text-black hover:underline"
           >  <button className="py-2 px-8 border border-gray-300 rounded-lg">
         
             הצג
           
           {/* {client.status === 'active' ? 'פעיל' : 'לא פעיל'} */}
         </button></Link></div>
 </div>)
        )}
       
        {/* <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border border-gray-300">מספר לקוח</th>
              <th className="p-3 border border-gray-300">עסק</th>
              <th className="p-3 border border-gray-300">מספר הזמנות</th>
              <th className="p-3 border border-gray-300">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id}>
                <td className="p-3 border border-gray-300">{client.clientNumber}</td>
                <td className="p-3 border border-gray-300">{client.businessName}</td>
               
                <td className="p-3 border border-gray-300">{client.ordersCount}</td>
                <Link
                    href={`/supplier/client-details/${client.id}`}
                    className="text-blue-500 hover:underline"
                  >  <td className="p-3 border border-gray-300">
                
                    הצג
                  
                </td></Link>
              </tr>
            ))}
          </tbody>
        </table> */}
      </div>
    </div>
  );
}
