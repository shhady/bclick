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
    <div className="p-2 sm:p-4 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 border border-gray-100">
        {/* Header section with search and filters - no longer sticky */}
        <div className="w-full pb-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">לקוחות</h2>
              {searchQuery && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  נמצאו {stats.clientCount} לקוחות
                  {stats.totalOrders > 0 && ` עם ${stats.totalOrders} הזמנות`}
                </p>
              )}
            </div>
            <Link href={`/supplier/${supplierId}/add-client`} className="w-full md:w-auto">
              <button 
                className="w-full md:w-auto bg-customBlue text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
                suppressHydrationWarning
              >
                הוסף לקוח +
              </button>
            </Link>
          </div>

          {/* Enhanced Search Input */}
          <div className="mb-4 sm:mb-6 relative">
            <input
              type="text"
              placeholder="חפש לפי טלפון, מספר לקוח, אימייל..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 sm:py-4 px-10 sm:px-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-customBlue focus:border-transparent shadow-sm bg-gray-50 hover:bg-white transition-colors duration-200 text-sm"
              suppressHydrationWarning
            />
            <svg 
              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="mb-6 sm:mb-8">
            <div className="flex w-full bg-gray-100 p-1 rounded-lg shadow-inner">
              <button
                onClick={() => setStatusFilter('active')}
                className={`flex-1 py-2 sm:py-3 rounded-lg transition-all duration-300 font-medium text-sm ${
                  statusFilter === 'active'
                    ? 'bg-customBlue text-white shadow-md'
                    : 'bg-transparent text-gray-700 hover:bg-gray-200'
                }`}
                suppressHydrationWarning
              >
                פעיל
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`flex-1 py-2 sm:py-3 rounded-lg transition-all duration-300 font-medium text-sm ${
                  statusFilter === 'inactive'
                    ? 'bg-customBlue text-white shadow-md'
                    : 'bg-transparent text-gray-700 hover:bg-gray-200'
                }`}
                suppressHydrationWarning
              >
                לא פעיל
              </button>
            </div>
          </div>

          {/* Table Headers - Only visible on larger screens */}
          <div className='hidden sm:grid grid-cols-4 pt-4 pb-3 border-b border-gray-200 font-medium text-gray-600 text-sm'>
            <div className="text-start px-4">מספר לקוח</div>
            <div className="text-center">עסק</div>
            <div className="text-center">מספר הזמנות</div>
            <div className="text-center"></div>
          </div>
        </div>

        {/* Clients List */}
        <div className="overflow-x-auto mb-4">
          {sortedFilteredClients.length > 0 ? (
            <div className="space-y-0 mt-2 sm:mt-4 sm:space-y-2">
              {sortedFilteredClients.map((client) => (
                <div 
                  key={client.id} 
                  className="sm:grid sm:grid-cols-4 flex flex-col items-center sm:items-start p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 sm:border sm:border-transparent sm:hover:border-blue-100 border-b border-gray-200 sm:border-b-0 last:border-b-0 gap-2 sm:gap-0"
                >
                  {/* Mobile layout (card-like) - visible only on small screens */}
                  <div className="flex flex-col items-center gap-2 w-full sm:hidden">
                    <div className="text-center font-medium text-gray-800 mb-1">
                      <span className="bg-blue-100 text-customBlue py-1 px-3 rounded-full text-sm mb-1 inline-block">
                        מספר לקוח: {client.clientNumber}
                      </span>
                    </div>
                    <div className="text-center font-medium text-gray-700 mb-1">
                      {client.businessName}
                    </div>
                    <div className="text-center mb-2">
                      <span className="bg-purple-100 text-purple-700 py-1 px-3 rounded-full text-sm inline-block">
                        הזמנות: {client.ordersCount}
                      </span>
                    </div>
                    <Link href={`/supplier/${supplierId}/client/${client.id}`} className="w-full">
                      <button 
                        className="w-full py-2 px-6 bg-white border border-gray-200 rounded-lg hover:bg-customBlue hover:text-white transition-all duration-300 shadow-sm hover:shadow-md text-sm"
                        suppressHydrationWarning
                      >
                        הצג
                      </button>
                    </Link>
                  </div>

                  {/* Desktop layout - visible only on larger screens */}
                  <div className="hidden sm:block text-start font-medium text-gray-800 px-4">
                    <span className="bg-blue-100 text-customBlue py-1 px-3 rounded-full text-sm">
                      {client.clientNumber}
                    </span>
                  </div>
                  <div className="hidden sm:block text-center font-medium text-gray-700">{client.businessName}</div>
                  <div className="hidden sm:block text-center">
                    <span className="bg-purple-100 text-purple-700 py-1 px-3 rounded-full text-sm">
                      {client.ordersCount}
                    </span>
                  </div>
                  <div className="hidden sm:block text-center">
                    <Link href={`/supplier/${supplierId}/client/${client.id}`}>
                      <button 
                        className="py-2 px-6 bg-white border border-gray-200 rounded-lg hover:bg-customBlue hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                        suppressHydrationWarning
                      >
                        הצג
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 rounded-xl mt-4 sm:mt-6 bg-gray-50 border border-gray-100">
              <svg 
                className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-base sm:text-lg">
                {searchQuery 
                  ? 'לא נמצאו לקוחות התואמים את החיפוש'
                  : `אין לקוחות ${statusFilter === 'active' ? 'פעילים' : 'לא פעילים'}`
                }
              </p>
              {searchQuery && (
                <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">נסה לחפש מונח אחר</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
