import { connectToDB } from '@/utils/database';
import Cart from '@/models/cart';

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');
  const supplierId = searchParams.get('supplierId');
  const productId = searchParams.get('productId');

  if (!clientId || !supplierId || !productId) {
    return new Response(
      JSON.stringify({ error: 'clientId, supplierId, and productId are required.' }),
      { status: 400 }
    );
  }

  await connectToDB();

  try {
    const cart = await Cart.findOne({ clientId, supplierId });

    if (!cart) {
      return new Response(JSON.stringify({ message: 'Cart not found.' }), { status: 404 });
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    cart.updatedAt = new Date();
    await cart.save();

    return new Response(JSON.stringify({ cart }), { status: 200 });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}