import { Suspense } from 'react';
import { connectToDB } from '@/utils/database';
// import NewOrdersClient from './NewOrdersClient';
import Loader from '@/components/loader/Loader';
import { currentUser } from '@/utils/auth';
import Orders from './Orders';
import User from '@/models/user';
import Order from '@/models/order';

export default async function NewOrdersPage() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  try {
    await connectToDB();
    
    // Get the user's MongoDB document
    const dbUser = await User.findById(user.id);
    if (!dbUser) {
      return null;
    }

    // Direct database query with population
    const orders = await Order.find({
      [dbUser.role === 'supplier' ? 'supplierId' : 'clientId']: dbUser._id
    })
    .populate('clientId', 'businessName')
    .populate('supplierId', 'businessName')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    // Format orders for client consumption with proper serialization
    const formattedOrders = orders.map(order => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      clientId: order.clientId ? {
        _id: order.clientId._id.toString(),
        businessName: order.clientId.businessName
      } : null,
      supplierId: order.supplierId ? {
        _id: order.supplierId._id.toString(),
        businessName: order.supplierId.businessName
      } : null
    }));

    return (
      <div>
        <Suspense fallback={<Loader />}>
          <Orders initialOrders={formattedOrders} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error fetching orders:', error);
    return <div>Error loading orders</div>;
  }
}