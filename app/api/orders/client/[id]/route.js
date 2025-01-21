import { connectToDB } from '@/utils/database';
import Order from '@/models/order';

export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    // Await the entire params object first
    const resolvedParams = await params;
    const clientId = resolvedParams.id;
    
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');

    // Query orders with both clientId and supplierId
    const orders = await Order.find({ 
      clientId,
      supplierId 
    })
      .populate('clientId', 'email name businessName')
      .populate('supplierId', 'name businessName email')
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .lean();

    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch client orders' }), 
      { status: 500 }
    );
  }
} 