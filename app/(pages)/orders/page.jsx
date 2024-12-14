import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import User from '@/models/user';
import { connectToDB } from '@/utils/database';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';

// Dynamically import the client-side component
const Orders = dynamic(() => import('./Orders'));

export default async function Page() {
  await connectToDB();

  const user = await currentUser();
  const userId = user.id;
  console.log("-------------------------------------", userId);
  let userFetched = null;

  try {
    // Fetch the user and populate their orders
    userFetched = await User.findOne({ clerkId: userId })
      .lean()
      .populate({
        path: 'orders', // Populate the orders array in the user object
        populate: [
          {
            path: 'items.productId', // Populate product details in order items
            model: 'Product',
            select: 'name price barCode', // Select relevant fields from products
          },
          {
            path: 'supplierId', // Populate supplier details for the order
            model: 'User',
            select: 'name email phone address city businessName businessNumber',
          },
          {
            path: 'clientId', // Populate client details for the order
            model: 'User',
            select: 'name email phone address city clientNumber businessName businessNumber',
          },
        ],
      });

      console.log(userFetched);
    if (!userFetched) {
      // If user is not found in the database, fallback to basic user details from Clerk
      userFetched = {
        clerkId: userId,
        role: 'client',
        name: `${user.firstName} ${user.lastName}`,
        profileImage: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        orders: [], // Default to an empty orders array
      };
    }

    console.log('Fetched user with populated orders:', userFetched);
  } catch (err) {
    console.error('Error fetching user with orders:', err);
  }

  // Serialize the userFetched object to pass to the client
  const serializedUser = JSON.parse(JSON.stringify(userFetched));

  return (
    <div>
      <Suspense fallback={<Loader />}>
        <Orders user={serializedUser} orders={serializedUser.orders}/>
      </Suspense>
    </div>
  );
}
