import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const userId = searchParams.get('userId');
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { message: 'userId is required' },
        { status: 400 }
      );
    }

    await connectToDB();

    // Find user by _id and populate their orders
    const user = await User.findById(userId)
      .populate({
        path: 'orders',
        options: {
          sort: { createdAt: -1 },
          skip: skip,
          limit: limit
        },
        // Deep populate all order fields
        populate: [
          {
            path: 'clientId',
            select: 'email name businessName'
          },
          {
            path: 'supplierId',
            select: 'name businessName email'
          },
          {
            path: 'items.productId',
            model: 'Product'
          }
        ]
      })
      .lean();

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Get total count of user's orders for pagination
    const totalOrders = await User.findById(userId).select('orders').lean().then(u => u?.orders?.length || 0);

    const hasMore = totalOrders > (skip + limit);

    return NextResponse.json({
      orders: user.orders || [],
      hasMore,
      total: totalOrders
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}



