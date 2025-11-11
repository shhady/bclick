'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinRequestsPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params?.id;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/get-user/${supplierId}`);
        if (!res.ok) throw new Error('Failed to load supplier');
        const supplier = await res.json();
        const pending = (supplier?.relatedUsers || [])
          .filter((r) => r?.status === 'pending' && r?.user)
          .map((r) => ({
            id: r.user?._id,
            name: r.user?.name,
            businessName: r.user?.businessName,
            phone: r.user?.phone,
            email: r.user?.email,
            status: r.status,
          }));
        if (isMounted) setRequests(pending || []);
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (supplierId) load();
    return () => {
      isMounted = false;
    };
  }, [supplierId]);

  if (loading) return <div className="p-4 max-w-5xl mx-auto">טוען בקשות...</div>;
  if (error) return <div className="p-4 max-w-5xl mx-auto text-red-600">{error}</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">בקשות הצטרפות</h1>
          <Link href={`/supplier/${supplierId}/clients`} className="text-customBlue underline">
            חזרה ללקוחות
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="text-gray-600">אין בקשות הצטרפות חדשות</div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex flex-col">
                  <span className="font-medium">{req.businessName || req.name || 'לקוח'}</span>
                  <span className="text-sm text-gray-600">{req.phone || req.email || ''}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/supplier/${supplierId}/client-request/${req.id}`}>
                    <button className="px-3 py-1.5 rounded-md bg-customBlue text-white hover:bg-blue-600">
                      הצג בקשה
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


