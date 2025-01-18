export const dynamicMode = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import React from 'react';
import { connectToDB } from '@/utils/database';
import dynamicImport from 'next/dynamic';
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';
import Order from '@/models/order';

const Orders = dynamicImport(() => import('./Orders'));

export default async function OrdersPage() {
  await connectToDB();
  
  try {
    // Fetch initial batch of orders with limit
    const orders = await Order.find()
      .populate('clientId', 'email name businessName')
      .populate('supplierId', 'name businessName email')
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const serializedOrders = JSON.parse(JSON.stringify(orders));

    return (
      <div>
        <Suspense fallback={<Loader />}>
          <Orders initialOrders={serializedOrders || []} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error fetching orders:', error);
    return <div>Error loading orders</div>;
  }
}
