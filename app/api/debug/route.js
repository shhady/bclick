import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDB();
    
    const count = await Order.countDocuments();
    const latestOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('orderNumber createdAt');

    return NextResponse.json({
      totalOrders: count,
      latestOrders: latestOrders,
      databaseHost: process.env.MONGODB_URI?.split('@')[1]?.split('/')[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 