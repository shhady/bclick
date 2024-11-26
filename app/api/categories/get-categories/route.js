import { connectToDB } from '@/utils/database';
import Category from '@/models/category';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  await connectToDB();

  const url = new URL(req.url);
  const supplierId = url.searchParams.get('supplierId'); // Get supplierId from query parameters

  if (!supplierId) {
    return new Response(
      JSON.stringify({ error: 'Supplier ID is required.' }),
      { status: 400 }
    );
  }

  try {
    const categories = await Category.find({ supplierId }).sort({ createdAt: -1 }); // Fetch categories by supplierId
    return new Response(
      JSON.stringify(categories),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
