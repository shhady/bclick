import { connectToDB } from '@/utils/database';
import Product from '@/models/product';

export const dynamic = 'force-dynamic';

export async function PUT(req) {
  await connectToDB();

  try {
    const { productId, supplierId, updates } = await req.json();

    if (!productId || !supplierId || !updates) {
      return new Response(JSON.stringify({ error: 'Product ID, Supplier ID, and updates are required.' }), {
        status: 400,
      });
    }

    // Find the product
    const product = await Product.findById(productId);

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found.' }), { status: 404 });
    }

    // Check if the supplier owns the product
    if (product.supplierId.toString() !== supplierId) {
      return new Response(JSON.stringify({ error: 'Unauthorized access.' }), { status: 403 });
    }

    // Update product details
    Object.assign(product, updates);

    // Automatically change status to 'active' if stock is updated to more than 0
    if (updates.stock > 0) {
      product.status = updates.status;
    } else if (updates.stock == 0) {
        product.status = 'out_of_stock';
      }
    await product.save();

    return new Response(JSON.stringify({ message: 'Product updated successfully.', product }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
