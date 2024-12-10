import { connectToDB } from '@/utils/database';
import Cart from '@/models/cart';

export async function PUT(req) {
  await connectToDB();

  try {
    const { clientId, supplierId, productId, quantity } = await req.json();

    if (!clientId || !supplierId || !productId || quantity == null) {
      return new Response(
        JSON.stringify({ error: 'clientId, supplierId, productId, and quantity are required.' }),
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ clientId, supplierId });

    if (!cart) {
      return new Response(JSON.stringify({ message: 'Cart not found.' }), { status: 404 });
    }

    const existingItem = cart.items.find((item) => item.productId.toString() === productId);

    if (!existingItem) {
      return new Response(JSON.stringify({ message: 'Product not found in cart.' }), { status: 404 });
    }

    existingItem.quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();

    return new Response(JSON.stringify({ cart }), { status: 200 });
  } catch (error) {
    console.error('Error updating cart:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}