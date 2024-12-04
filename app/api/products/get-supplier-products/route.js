import { connectToDB } from '@/utils/database';
import Product from '@/models/product';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  await connectToDB();

  try {
    const url = new URL(req.url);
    const supplierId = url.searchParams.get('supplierId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (!supplierId) {
      return new Response(
        JSON.stringify({ error: 'Supplier ID is required.' }),
        { status: 400 }
      );
    }

    // Update out-of-stock product statuses in bulk
    await Product.updateMany(
      { supplierId, stock: 0, status: { $ne: 'out_of_stock' } },
      { status: 'out_of_stock' }
    );

    // Fetch paginated products
    const products = await Product.find({ supplierId })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get total count for pagination metadata
    const totalProducts = await Product.countDocuments({ supplierId });

    return new Response(
      JSON.stringify({
        products: products.map((product) => ({
          ...product,
          _id: product._id.toString(),
          supplierId: product.supplierId.toString(),
        })),
        total: totalProducts,
        page,
        pages: Math.ceil(totalProducts / limit),
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
