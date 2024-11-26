import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function GET(req,{params}) {
  await connectToDB();
  const { id } = await params;

  // const supplierId = new URL(req.url).searchParams.get('supplierId');
  console.log("----------------------------------------"+id);
  if (!id) {
    return new Response(JSON.stringify({ error: 'Supplier ID is required' }), { status: 400 });
  }

  try {
    const supplier = await User.findById(id).populate('relatedUsers.user');
    console.log("============================================" + supplier);
    if (!supplier) {
      return new Response(JSON.stringify({ error: 'Supplier not found' }), { status: 404 });
    }

    const clients = supplier.relatedUsers.map((relatedUser, index) => ({
      number: index + 1, // Client number based on position in the array
      id: relatedUser.user._id,
      name: relatedUser.user.name,
      businessName: relatedUser.user.businessName,
      phone: relatedUser.user.phone,
      email: relatedUser.user.email,
      ordersCount: relatedUser.user.orders.length,
      status: relatedUser.status,
    }));

    return new Response(JSON.stringify(clients), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
