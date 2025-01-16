export const dynamicMode = 'force-dynamic'; // Rename the exported constant
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import User from '@/models/user';
import { connectToDB } from '@/utils/database';
import dynamicImport from 'next/dynamic'; // Rename the import to `dynamicImport`
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';
import Order from '@/models/order';

// Dynamically import the client-side component
const Orders = dynamicImport(() => import('./Orders')); // Use renamed import

export default async function OrdersPage() {
  await connectToDB();
  
  try {
    // Fetch only initial batch of orders (e.g., last 10)
    const orders = await Order.find()
      .populate('clientId', 'email name businessName') 
      .populate('supplierId', 'name businessName email')
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .limit(10)  // Add limit
      .lean();

    const serializedOrders = JSON.parse(JSON.stringify(orders));

    return (
      <div>
        <Suspense fallback={<Loader />}>
          <Orders initialOrders={serializedOrders} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error fetching orders:', error);
    return <div>Error loading orders</div>;
  }
}
