'use client';

import Link from 'next/link';
import React, { useState, useMemo, useEffect } from 'react';

export default function Clients({ clients, supplierId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  // Simple debounce implementation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Enhanced search and filter logic using useMemo
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // First check status filter
      const matchesStatus = statusFilter === client.status;
      if (!matchesStatus) return false;

      // If no search query, return status match
      if (!debouncedSearch.trim()) return true;

      // Normalize search terms
      const searchTerm = debouncedSearch.toLowerCase().trim();
      const searchParts = searchTerm.split(/\s+/); // Split search by whitespace for multi-term search

      // Special handling for client number - exact match check
      const isClientNumberSearch = !isNaN(searchTerm);
      if (isClientNumberSearch) {
        return client.clientNumber === parseInt(searchTerm);
      }

      // Normalize client data for searching
      const clientData = {
        name: (client.name || '').toLowerCase(),
        businessName: (client.businessName || '').toLowerCase(),
        phone: (client.phone || '').toLowerCase(),
        email: (client.email || '').toLowerCase(),
        clientNumber: client.clientNumber?.toString() || ''
      };

      // Check if ALL search terms match ANY client field
      return searchParts.every(term => {
        // If term is a number, check exact match with clientNumber
        if (!isNaN(term) && term === clientData.clientNumber) {
          return true;
        }
        
        // Otherwise check includes for text fields
        return clientData.name.includes(term) ||
               clientData.businessName.includes(term) ||
               clientData.phone.includes(term) ||
               clientData.email.includes(term) ||
               clientData.clientNumber.includes(term);
      });
    });
  }, [clients, debouncedSearch, statusFilter]);

  // Sort the filtered clients by clientNumber
  const sortedFilteredClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => a.clientNumber - b.clientNumber);
  }, [filteredClients]);

  // Calculate some stats for the filtered results
  const stats = useMemo(() => ({
    totalOrders: sortedFilteredClients.reduce((sum, client) => sum + (client.ordersCount || 0), 0),
    clientCount: sortedFilteredClients.length
  }), [sortedFilteredClients]);

  return (
    <div className="px-4 md:p-0">
      <div className="sticky top-12 md:top-20 bg-[#f8f8ff] w-full md:px-3 pt-6 pb-1 z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-semibold">לקוחות</h2>
            {searchQuery && (
              <p className="text-sm text-gray-600">
                נמצאו {stats.clientCount} לקוחות
                {stats.totalOrders > 0 && ` עם ${stats.totalOrders} הזמנות`}
              </p>
            )}
          </div>
          <Link href={`/supplier/${supplierId}/add-client`}>
            <button 
              className="bg-customBlue text-white px-4 py-2 rounded-lg hover:bg-hoveredBlue"
              suppressHydrationWarning
            >
              הוסף לקוח +
            </button>
          </Link>
        </div>

        {/* Enhanced Search Input */}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="חפש לפי טלפון, מספר לקוח, אימייל, שם עסק או שם לקוח..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-customBlue focus:border-transparent"
            suppressHydrationWarning
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex justify-between mb-4">
          <div className="flex w-full">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-r-md flex-1 transition-colors duration-200 ${
                statusFilter === 'active'
                  ? 'bg-customBlue text-white'
                  : 'bg-customGray text-gray-700 hover:bg-gray-200'
              }`}
              suppressHydrationWarning
            >
              פעיל
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-4 py-2 rounded-l-md border-l border-white flex-1 transition-colors duration-200 ${
                statusFilter === 'inactive'
                  ? 'bg-customBlue text-white'
                  : 'bg-customGray text-black hover:bg-gray-200'
              }`}
              suppressHydrationWarning
            >
              לא פעיל
            </button>
          </div>
        </div>

        {/* Table Headers */}
        <div className='grid grid-cols-4 pt-4 pb-2 border-b-2 border-gray-700'>
          <div className="text-start font-medium">מספר לקוח</div>
          <div className="text-center font-medium">עסק</div>
          <div className="text-center font-medium">מספר הזמנות</div>
          <div className="text-center"></div>
        </div>
      </div>

      {/* Clients List */}
      <div className="overflow-x-auto mb-24 md:mb-4">
        {sortedFilteredClients.length > 0 ? (
          sortedFilteredClients.map((client) => (
            <div 
              key={client.id} 
              className='grid grid-cols-4 border-b-2 border-[#D9D9D9] items-center p-2 px-2 md:px-3 hover:bg-gray-50'
            >
              <div className="text-start">{client.clientNumber}</div>
              <div className="text-center">{client.businessName}</div>
              <div className="text-center">{client.ordersCount}</div>
              <div className="text-center">
                <Link href={`/supplier/${supplierId}/client/${client.id}`}>
                  <button 
                    className="py-2 px-8 border border-gray-300 rounded-lg hover:bg-customGray hover:text-customGrayText transition-colors duration-200"
                    suppressHydrationWarning
                  >
                    הצג
                  </button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchQuery 
              ? 'לא נמצאו לקוחות התואמים את החיפוש'
              : `אין לקוחות ${statusFilter === 'active' ? 'פעילים' : 'לא פעילים'}`
            }
          </div>
        )}
      </div>
    </div>
  );
}
