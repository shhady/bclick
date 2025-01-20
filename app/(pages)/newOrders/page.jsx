import { Suspense } from 'react';
import { connectToDB } from '@/utils/database';
import NewOrdersClient from './NewOrdersClient';
import Loader from '@/components/loader/Loader';
import { currentUser } from '@clerk/nextjs/server';

export default async function NewOrdersPage() {
  const user = await currentUser();
  await connectToDB();
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/generalOrders?page=1&limit=15&clerkId=${user?.id}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return (
      <div>
        <Suspense fallback={<Loader />}>
          <NewOrdersClient initialOrders={data.orders} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error fetching orders:', error);
    return <div>Error loading orders</div>;
  }
}
