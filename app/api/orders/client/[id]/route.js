import { connectToDB } from '@/utils/database';
import Order from '@/models/order';

export async function GET(request, { params }) {
  try {
    await connectToDB();

    const clientId = await params.id;
    const orders = await Order.find({ clientId })
      .populate('clientId', 'email name businessName')
      .populate('supplierId', 'name businessName email')
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .lean();

    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch client orders' }), { status: 500 });
  }
} 