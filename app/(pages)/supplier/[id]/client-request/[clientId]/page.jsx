'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ClientRequestPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params?.id;
  const clientId = params?.clientId;

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchClient = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/get-user/${clientId}`);
        if (!res.ok) throw new Error('Failed to load client');
        const data = await res.json();
        if (isMounted) {
          setClient(data);
        }
      } catch (e) {
        if (isMounted) setError(e.message || 'Error loading client');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (clientId) fetchClient();
    return () => {
      isMounted = false;
    };
  }, [clientId]);

  const approveClient = useCallback(async () => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/suppliers/toggle-client-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId, clientId, status: 'active' }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to approve client');
      }
      router.push(`/supplier/${supplierId}/client/${clientId}`);
    } catch (e) {
      setError(e.message || 'Failed to approve client');
    } finally {
      setSubmitting(false);
    }
  }, [supplierId, clientId, router]);

  const rejectRequest = useCallback(async () => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/suppliers/remove-related-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId, clientId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to reject request');
      }
      router.push(`/supplier/${supplierId}/clients`);
    } catch (e) {
      setError(e.message || 'Failed to reject request');
    } finally {
      setSubmitting(false);
    }
  }, [supplierId, clientId, router]);

  if (loading) {
    return <div className="p-4 max-w-2xl mx-auto">טוען לקוח...</div>;
  }
  if (error) {
    return <div className="p-4 max-w-2xl mx-auto text-red-600">{error}</div>;
  }
  if (!client) {
    return <div className="p-4 max-w-2xl mx-auto">לקוח לא נמצא</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">בקשת הצטרפות - פרטי לקוח</h1>

      <div className="p-4 border rounded-lg shadow-lg bg-white">
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
            {client?.profileImage ? (
              <Image
                src={client.profileImage}
                alt={client.businessName || client.name || 'Client'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                אין תמונה
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <p><span className="font-medium">שם:</span> {client.name || '-'}</p>
            <p><span className="font-medium">שם עסק:</span> {client.businessName || '-'}</p>
            <p><span className="font-medium">אימייל:</span> {client.email || '-'}</p>
            <p><span className="font-medium">טלפון:</span> {client.phone || '-'}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={approveClient}
            disabled={submitting}
            className={`px-4 py-2 rounded-lg text-white ${submitting ? 'bg-gray-400' : 'bg-customGreen hover:bg-green-600'}`}
          >
            אשר לקוח
          </button>
          <button
            onClick={() => router.push(`/supplier/${supplierId}/client/${clientId}`)}
            className="px-4 py-2 rounded-lg bg-customBlue text-white hover:bg-blue-600"
          >
            עבור לכרטיס לקוח
          </button>
          <button
            onClick={rejectRequest}
            disabled={submitting}
            className={`px-4 py-2 rounded-lg text-white ${submitting ? 'bg-gray-400' : 'bg-customRed hover:bg-red-600'}`}
          >
            דחה בקשה
          </button>
        </div>
      </div>
    </div>
  );
}


