import { connectToDB } from '@/utils/database';
import Category from '@/models/category';

export const dynamic = 'force-dynamic';

export async function PUT(req) {
    await connectToDB();
  
    try {
      const { categoryId, name, status } = await req.json();
  
      if (!categoryId) {
        return new Response(JSON.stringify({ error: 'Category ID is required.' }), { status: 400 });
      }
  
      const updateData = {};
      if (name) updateData.name = name;
      if (status) updateData.status = status;
  
      const updatedCategory = await Category.findByIdAndUpdate(categoryId, updateData, { new: true });
  
      if (!updatedCategory) {
        return new Response(JSON.stringify({ error: 'Category not found.' }), { status: 404 });
      }
  
      return new Response(JSON.stringify(updatedCategory), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
  