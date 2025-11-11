import React from 'react';
import { currentUser } from '@/utils/auth';
import User from '@/models/user';
import { connectToDB } from '@/utils/database';
import ClientProfileWrapper from './ClientProfileWrapper';

export default async function Page() {
  await connectToDB();

  const user = await currentUser();
  const userId = user?.id;
   
  let userFetched = null;
  try {
    userFetched = await User.findById(userId)
      .lean()
      .populate({
        path: 'relatedUsers.user',
        select: 'name email phone address role profileImage businessName coverImage ordersCount', // Specify fields to include
      })
      .populate({
        path: 'orders', // Populate orders
        select: '_id status', // Only include id and status
      });
    if (!userFetched) {
        userFetched= {
            role:'client',
            name: `${user?.firstName || ''}`.trim(),
            profileImage: user?.imageUrl || '',
            email: user?.emailAddresses?.[0]?.emailAddress || '',
            coverImage: user?.coverImage,
        }
    }
  } catch (err) {
    console.error('Error fetching user:', err);
  }

  // Serialize the userFetched object
  const serializedUser = JSON.parse(JSON.stringify(userFetched));
 
  return <ClientProfileWrapper user={serializedUser} />;
}
