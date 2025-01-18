import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    await connectToDB();

    // Get total count
    const total = await Order.countDocuments();

    // Get orders with full population
    const orders = await Order.find()
      .populate('clientId', 'email name businessName')
      .populate('supplierId', 'name businessName email')
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      orders,
      hasMore: skip + orders.length < total,
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