import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/database';
import Order from '@/models/order';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request) {
  // Add cache control headers
  const headers = {
    'Cache-Control': 'no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    await connectToDB();
    const orders = await Order.find()
      .populate('clientId', 'email name businessName') // Populate client details
      .populate('supplierId', 'name businessName email')
      .populate('items.productId')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(orders, { headers });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers });
  }
} 