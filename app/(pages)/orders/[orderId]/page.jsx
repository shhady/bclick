import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import { currentUser } from '@clerk/nextjs/server';
import OrderDetailsClient from './OrderDetailsClient';
import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import User from '@/models/user';

async function getOrderData(orderId, clerkId) {
  try {
    await connectToDB();
    
    // First get the user to check permissions
    const user = await User.findOne({ clerkId }).select('_id role').lean();
    if (!user) return null;

    const order = await Order.findById(orderId)
      .populate('clientId', 'businessName email phone address city')
      .populate('supplierId', 'businessName')
      .populate('items.productId', 'name price')
      .lean();

    if (!order) {
      return null;
    }

    // Check permissions
    const hasPermission = 
      (user.role === 'supplier' && order.supplierId._id.toString() === user._id.toString()) ||
      (user.role === 'client' && order.clientId._id.toString() === user._id.toString());

    if (!hasPermission) {
      return null;
    }

    // Format the data for client consumption
    return {
      ...order,
      _id: order._id.toString(),
      clientId: {
        _id: order.clientId._id.toString(),
        businessName: order.clientId.businessName,
        email: order.clientId.email,
        phone: order.clientId.phone,
        address: order.clientId.address,
        city: order.clientId.city
      },
      supplierId: {
        _id: order.supplierId._id.toString(),
        businessName: order.supplierId.businessName,
        email: order.clientId.email,
        phone: order.clientId.phone,
        address: order.clientId.address,
        city: order.clientId.city
      },
      items: order.items.map(item => ({
        ...item,
        _id: item._id.toString(),
        productId: {
          _id: item.productId._id.toString(),
          name: item.productId.name,
          price: item.productId.price
        }
      })),
      notes: order.notes?.map(note => ({
        _id: note._id.toString(),
        message: note.message,
        date: note.date.toISOString(),
        userId: note.userId?.toString() || null
      })) || [],
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

export default async function OrderPage({ params }) {
  const { orderId } = await params;
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const orderData = await getOrderData(orderId, user.id);
  
  if (!orderData) {
    notFound();
  }

  return (
    <Suspense fallback={<OrderSkeleton />}>
      <OrderDetailsClient initialOrder={orderData} />
    </Suspense>
  );
}

// Loading skeleton component
const OrderSkeleton = () => (
  <div className="p-4 space-y-4" dir="rtl">
    <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
      {/* Add more skeleton UI elements as needed */}
    </div>
  </div>
); 