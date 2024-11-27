import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function PUT(req) {
  try {
    const { supplierId, clientId, status } = await req.json();

    await connectToDB();

    // Find the supplier
    const supplier = await User.findById(supplierId);

    if (!supplier) {
      return new Response(JSON.stringify({ error: 'Supplier not found.' }), { status: 404 });
    }

    // Find the client
    const client = await User.findById(clientId);

    if (!client) {
      return new Response(JSON.stringify({ error: 'Client not found.' }), { status: 404 });
    }

    // Update status in the supplier's relatedUsers
    const supplierRelatedUser = supplier.relatedUsers.find(
      (rel) => rel.user.toString() === clientId
    );

    if (!supplierRelatedUser) {
      return new Response(
        JSON.stringify({ error: 'Client not found in supplier\'s relatedUsers.' }),
        { status: 404 }
      );
    }

    supplierRelatedUser.status = status; // Update the status
    await supplier.save(); // Save changes to the supplier

    // Update status in the client's relatedUsers
    const clientRelatedUser = client.relatedUsers.find(
      (rel) => rel.user.toString() === supplierId
    );

    if (!clientRelatedUser) {
      return new Response(
        JSON.stringify({ error: 'Supplier not found in client\'s relatedUsers.' }),
        { status: 404 }
      );
    }

    clientRelatedUser.status = status; // Update the status
    await client.save(); // Save changes to the client

    return new Response(
      JSON.stringify({ message: 'Status updated successfully for both supplier and client.' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating client status:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
