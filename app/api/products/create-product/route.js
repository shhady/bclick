import { connectToDB } from '@/utils/database';
import Product from '@/models/product';
import Category from '@/models/category';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  await connectToDB();

  try {
    const { name, description, categoryId, stock, price, imageUrl, status, supplierId } = await req.json();

    let finalCategoryId = categoryId;

    // Check or create the General category
    if (!categoryId || categoryId === 'General') {
      let generalCategory = await Category.findOne({ name: 'General', supplierId });
      if (!generalCategory) {
        generalCategory = new Category({ name: 'General', supplierId, status: 'shown' });
        await generalCategory.save();
      }
      finalCategoryId = generalCategory._id;
    }

    // Create the product
    const product = new Product({
      name,
      description,
      categoryId: finalCategoryId,
      stock,
      price,
      imageUrl,
      status,
      supplierId,
    });

    await product.save();
    return new Response(JSON.stringify({ message: 'Product created successfully.', product }), { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/products/create-product:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
