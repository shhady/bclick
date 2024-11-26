import { connectToDB } from '@/utils/database';
import Product from '@/models/product';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  await connectToDB();

  try {
    const url = new URL(req.url);
    const supplierId = url.searchParams.get('supplierId');

    if (!supplierId) {
      return new Response(JSON.stringify({ error: 'Supplier ID is required.' }), { status: 400 });
    }

    // Fetch products of the supplier
    const products = await Product.find({ supplierId }).lean();

    // Automatically update status to 'missing' for products with zero stock
    const updates = products
      .filter(product => product.stock === 0 && product.status !== 'out_of_stock')
      .map(product =>
        Product.findByIdAndUpdate(product._id, { status: 'out_of_stock' }, { new: true }).exec()
      );

    await Promise.all(updates); // Perform the updates

    // Fetch updated products
    const updatedProducts = await Product.find({ supplierId }).lean();

    return new Response(JSON.stringify(updatedProducts), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
