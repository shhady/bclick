import { connectToDB } from '@/utils/database';
import Product from '@/models/product';

export const dynamic = 'force-dynamic';

export async function DELETE(req) {
  await connectToDB();

  try {
    const { productId, supplierId } = await req.json();

    if (!productId || !supplierId) {
      return new Response(JSON.stringify({ error: 'Product ID and Supplier ID are required.' }), { status: 400 });
    }

    // Check if the product exists and belongs to the supplier
    const product = await Product.findOne({ _id: productId, supplierId });

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found or unauthorized access.' }), { status: 404 });
    }

    await Product.deleteOne({ _id: productId });

    return new Response(JSON.stringify({ message: 'Product deleted successfully.' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
