import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import Order from '@/models/order';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('userId');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }
    
    await connectToDB();
    
    // Validate that the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }
    
    // Get the user
    const user = await User.findOne({ _id: id });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Count pending orders with a more specific query
    const pendingOrdersCount = await Order.countDocuments({
      [user.role === 'supplier' ? 'supplierId' : 'clientId']: user._id,
      status: 'pending'
    });
    
    // Also get the actual pending orders to log them for debugging
    const pendingOrders = await Order.find({
      [user.role === 'supplier' ? 'supplierId' : 'clientId']: user._id,
      status: 'pending'
    }).select('_id orderNumber status').lean();
    
    // console.log(`Found ${pendingOrdersCount} pending orders for user ${id}:`, 
    //   pendingOrders.map(o => ({ id: o._id.toString(), number: o.orderNumber, status: o.status })));
    
    // Add cache control headers to prevent stale data
    return NextResponse.json(
      { 
        count: pendingOrdersCount,
        orders: pendingOrders.map(o => ({ 
          id: o._id.toString(), 
          number: o.orderNumber, 
          status: o.status 
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
    console.error('Error fetching pending orders count:', error);
    return NextResponse.json({ error: 'Failed to fetch pending orders count' }, { status: 500 });
  }
} 