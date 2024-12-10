import { connectToDB } from '@/utils/database';
import Cart from '@/models/cart';
import Product from '@/models/product';

export default async function handler(req) {
  if (req.method === 'POST') {
    const { clientId, supplierId, items } = await req.json();

    await connectToDB();

    try {
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`Product with ID ${item.productId} not found`);

        const availableStock = product.stock - (product.reserved || 0);
        if (item.quantity > availableStock) {
          throw new Error(
            `Insufficient stock for product ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`
          );
        }

        product.reserved = (product.reserved || 0) + item.quantity;
        await product.save();
      }

      // Clear the cart after submission
      await Cart.findOneAndDelete({ clientId, supplierId });

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
