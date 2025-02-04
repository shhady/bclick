import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    await connectToDB();
    const { orderId } =await params;

    const order = await Order.findById(orderId)
      .populate('items.productId')
      .populate('supplierId')
      .populate('clientId');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 