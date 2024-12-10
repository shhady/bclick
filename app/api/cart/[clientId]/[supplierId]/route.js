import { connectToDB } from '@/utils/database';
import Cart from '@/models/cart';

export default async function handler(req, { params }) {
  const { clientId, supplierId } = params;

  await connectToDB();

  if (req.method === 'GET') {
    try {
      const cart = await Cart.findOne({ clientId, supplierId })
        .populate('items.productId')
        .lean();

      if (!cart) {
        return new Response(JSON.stringify({ success: false, message: 'Cart not found' }), { status: 404 });
      }

      return new Response(JSON.stringify({ success: true, cart }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await Cart.findOneAndDelete({ clientId, supplierId });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
