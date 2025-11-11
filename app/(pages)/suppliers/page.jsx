import React from 'react';
import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import { currentUser } from '@/utils/auth';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const revalidate = 60;

export default async function SuppliersPage() {
  await connectToDB();

  const sessionUser = await currentUser();
  if (!sessionUser) {
    redirect('/login');
  }

  const clientId = sessionUser.id;

  const suppliers = await User.find({ role: 'supplier' })
    .select('name businessName city profileImage relatedUsers')
    .lean();

  const items = suppliers.map((s) => {
    const isActive =
      Array.isArray(s.relatedUsers) &&
      s.relatedUsers.some(
        (rel) => rel?.user?.toString() === clientId && rel?.status === 'active'
      );

    return {
      _id: s._id.toString(),
      name: s.name || '',
      businessName: s.businessName || '',
      city: s.city || '',
      profileImage:
        typeof s.profileImage === 'string' ? s.profileImage : (s.profileImage?.secure_url || ''),
      isActive,
    };
  });

  const activeItems = items.filter(i => i.isActive);
  const otherItems = items.filter(i => !i.isActive);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">ספקים</h1>

      {items.length === 0 && (
        <div className="text-gray-600">לא נמצאו ספקים</div>
      )}

      {activeItems.length > 0 && (
        <>
          <h2 className="text-xl md:text-2xl font-semibold mb-3">ספקים פעילים</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {activeItems.map((supplier) => (
              <Link
                key={supplier._id}
                href={`/catalog/${supplier._id}`}
                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex gap-3 items-center"
              >
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {supplier.profileImage ? (
                    <Image
                      src={supplier.profileImage}
                      alt={supplier.businessName || supplier.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-sm">אין תמונה</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">
                      {supplier.businessName || supplier.name}
                    </p>
                    <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">
                      פעיל
                    </span>
                  </div>
                  {supplier.city && (
                    <p className="text-sm text-gray-500">{supplier.city}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 className="text-xl md:text-2xl font-semibold mb-3">ספקים</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {otherItems.map((supplier) => (
          <Link
            key={supplier._id}
            href={`/catalog/${supplier._id}`}
            className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex gap-3 items-center"
          >
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {supplier.profileImage ? (
                <Image
                  src={supplier.profileImage}
                  alt={supplier.businessName || supplier.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-sm">אין תמונה</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate">
                  {supplier.businessName || supplier.name}
                </p>
              </div>
              {supplier.city && (
                <p className="text-sm text-gray-500">{supplier.city}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


