import { connectToDB } from '@/utils/database';
import Order from '@/models/order';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    await connectToDB();

    const orders = await Order.find()
      .populate('clientId', 'email name businessName')
      .populate('supplierId', 'name businessName email')
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), { status: 500 });
  }
} 