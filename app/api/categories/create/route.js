import { connectToDB } from '@/utils/database';
import Category from '@/models/category';

export async function POST(req) {
  await connectToDB();

  try {
    const { name, supplierId } = await req.json();

    if (!name || !supplierId) {
      return new Response(
        JSON.stringify({ error: 'Name and supplierId are required.' }),
        { status: 400 }
      );
    }

    // Check if the General category already exists
    let category = await Category.findOne({ name, supplierId });
    if (!category) {
      category = new Category({ name, supplierId, status: 'shown' });
      await category.save();
    }

    return new Response(JSON.stringify({ category }), { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/categories/create:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
