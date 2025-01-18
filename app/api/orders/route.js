import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('role');
    const skip = (page - 1) * limit;

    await connectToDB();

    // Build query based on user role and ID
    let query = {};
    if (userId && userRole) {
      if (userRole === 'supplier') {
        query.supplierId = userId;
      } else if (userRole === 'client') {
        query.clientId = userId;
      }
    }

    // Get total count of filtered orders
    const total = await Order.countDocuments(query);

    // Get orders with full population
    const orders = await Order.find(query)
      .populate('clientId', 'email name businessName')
      .populate('supplierId', 'name businessName email')
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate if there are more orders
    const hasMore = total > (skip + orders.length);

    console.log({
      page,
      limit,
      skip,
      total,
      ordersLength: orders.length,
      hasMore,
      userId,
      userRole,
      query
    }); // Debug info

    return NextResponse.json({
      orders,
      hasMore,
      total
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 