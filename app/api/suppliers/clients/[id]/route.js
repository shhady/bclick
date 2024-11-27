import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function GET(req, { params }) {
  await connectToDB();
  const { id } = await params; // Extract `id` from params

  if (!id) {
    return new Response(JSON.stringify({ error: 'Supplier ID is required' }), { status: 400 });
  }

  try {
    // Populate `relatedUsers.user` field
    const supplier = await User.findById(id).populate('relatedUsers.user');
    
    if (!supplier) {
      return new Response(JSON.stringify({ error: 'Supplier not found' }), { status: 404 });
    }

    const clients = supplier.relatedUsers
      .filter((relatedUser) => relatedUser.user) // Exclude null users
      .map((relatedUser) => ({
        clientNumber: relatedUser.user.clientNumber,
        id: relatedUser.user._id,
        name: relatedUser.user.name,
        businessName: relatedUser.user.businessName,
        phone: relatedUser.user.phone,
        email: relatedUser.user.email,
        ordersCount: relatedUser.user.orders?.length || 0,
        status: relatedUser.status,
      }));

    return new Response(JSON.stringify(clients), { status: 200 });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
