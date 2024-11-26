import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function PUT(req) {
  await connectToDB();

  try {
    const { supplierId, clientId, status } = await req.json();

    const supplier = await User.findById(supplierId);
    const client = await User.findById(clientId);

    if (!supplier || !client) {
      return new Response(JSON.stringify({ error: 'Supplier or Client not found' }), { status: 404 });
    }

    // Update status in supplier's relatedUsers
    const supplierRel = supplier.relatedUsers.find((rel) => rel.user.toString() === clientId);
    if (supplierRel) {
      supplierRel.status = status;
    }

    // Update status in client's relatedUsers
    const clientRel = client.relatedUsers.find((rel) => rel.user.toString() === supplierId);
    if (clientRel) {
      clientRel.status = status;
    }

    await supplier.save();
    await client.save();

    return new Response(
      JSON.stringify({ message: 'Status updated successfully', status }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
