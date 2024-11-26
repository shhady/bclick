import { connectToDB } from '@/utils/database';
import Category from '@/models/category';

export const dynamic = 'force-dynamic';

export async function DELETE(req) {
    await connectToDB();
  
    try {
      const { categoryId } = await req.json();
  
      if (!categoryId) {
        return new Response(JSON.stringify({ error: 'Category ID is required.' }), { status: 400 });
      }
  
      await Category.findByIdAndDelete(categoryId);
      return new Response(JSON.stringify({ message: 'Category deleted successfully.' }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
  