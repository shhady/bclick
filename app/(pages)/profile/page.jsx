import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import User from '@/models/user';
import { connectToDB } from '@/utils/database';
import dynamic from 'next/dynamic';

// Dynamically import the client-side component
const ProfilePage = dynamic(() => import('./ProfilePage'));

export default async function Page() {
  await connectToDB();

  const user = await currentUser();
  const userId = user.id;

  let userFetched = null;
  try {
    userFetched = await User.findOne({ clerkId: userId }).lean();
    if (!userFetched) {
      console.log('User not found in database');
      return <div>User not found</div>;
    }
    console.log('Fetched user:', userFetched);
  } catch (err) {
    console.error('Error fetching user:', err);
  }

  // Serialize the userFetched object
  const serializedUser = JSON.parse(JSON.stringify(userFetched));

  return (
    <div>
      <ProfilePage user={serializedUser} />
    </div>
  );
}
