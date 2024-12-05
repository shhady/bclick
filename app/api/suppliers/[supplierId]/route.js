import connectToDB from '@/utils/database';
import User from '@/models/user';

export async function GET(req, { params }) {
  const { supplierId } = params;

  await connectToDB();

  if (!supplierId) {
    return new Response(JSON.stringify({ error: 'Supplier ID is required.' }), {
      status: 400,
    });
  }

  try {
    const supplier = await User.findById(supplierId).lean();

    if (!supplier) {
      return new Response(
        JSON.stringify({ error: 'Supplier not found.' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ name: supplier.businessName || 'Unnamed Supplier' }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
