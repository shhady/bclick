import { connectToDB } from '@/utils/database';
import Product from '@/models/product';
import User from '@/models/user';

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

    // Delete the product
    await Product.deleteOne({ _id: productId });

    // Remove the product from the supplier's `products` array
    await User.findByIdAndUpdate(
      supplierId,
      { $pull: { products: productId } }, // Remove product ID from the array
      { new: true }
    );

    return new Response(JSON.stringify({ message: 'Product deleted successfully.' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
