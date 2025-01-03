export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import User from '@/models/user';
import { connectToDB } from '@/utils/database';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';
import Order from '@/models/order';

// Dynamically import the client-side component
const Orders = dynamic(() => import('./Orders'));

export default async function OrdersPage() {
  await connectToDB();
  
  try {
    const orders = await Order.find()
      .populate('clientId', 'email name businessName') // Populate client details
      .populate('supplierId', 'name businessName email')
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .lean(); // Add lean() for better performance

    // Serialize the orders to prevent JSON circular references
    const serializedOrders = JSON.parse(JSON.stringify(orders));

    return (
      <div>
        <Suspense fallback={<Loader />}>
          <Orders orders={serializedOrders} />
        </Suspense>
      </div>
    );

  } catch (error) {
    console.error('Error fetching orders:', error);
    return <div>Error loading orders</div>;
  }
}
