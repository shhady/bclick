import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import Order from '@/models/order';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }
    
    await connectToDB();
    
    // Validate that the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }
    
    // Get the user
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get pending orders
    const pendingOrders = await Order.find({
      [user.role === 'supplier' ? 'supplierId' : 'clientId']: user._id,
      status: 'pending'
    }).select('_id orderNumber status createdAt').lean();
    
    console.log(`Found ${pendingOrders.length} pending orders for user ${userId}`);
    
    // Return the pending orders
    return NextResponse.json(
      { 
        orders: pendingOrders.map(o => ({ 
          id: o._id.toString(), 
          number: o.orderNumber, 
          status: o.status,
          createdAt: o.createdAt
        }))
      },
      { 
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Pragma': 'no-cache'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    return NextResponse.json({ error: 'Failed to fetch pending orders' }, { status: 500 });
  }
} 