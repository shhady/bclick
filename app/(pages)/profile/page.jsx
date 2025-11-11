import React from 'react';
import { currentUser } from '@/utils/auth';
import User from '@/models/user';
import { connectToDB } from '@/utils/database';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';
// Use dynamic import with proper loading configuration
const ProfilePage = dynamic(() => import('./ProfilePage'), {
  loading: () => <Loader />,
  ssr: true,
  suspense: true
});

export default async function Page() {
  await connectToDB();

  const user = await currentUser();
  const userId = user?.id;
   
  let userFetched = null;
  try {
    if (userId) {
      userFetched = await User.findById(userId)
        .populate({
          path: 'relatedUsers.user',
          select: 'name email phone address role profileImage businessName coverImage',
        })
        .populate({
          path: 'orders',
          select: '_id status',
        })
        .lean();
    }
  } catch (err) {
    console.error('Error fetching user:', err);
  }

  // Serialize the userFetched object
  const serializedUser = JSON.parse(JSON.stringify(userFetched));

  return (
    <div>
        <Suspense fallback={<Loader/>}>
      <ProfilePage user={serializedUser} /></Suspense>
    </div>
  );
}
