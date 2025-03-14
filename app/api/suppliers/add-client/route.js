import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function POST(req) {
  await connectToDB();

  try {
    const { supplierId, clientId } = await req.json();

    if (!supplierId || !clientId) {
      return new Response(
        JSON.stringify({ error: 'Both supplier ID and client ID are required' }),
        { status: 400 }
      );
    }

    // Check if both users exist
    const [supplier, client] = await Promise.all([
      User.findById(supplierId),
      User.findById(clientId)
    ]);

    if (!supplier) {
      return new Response(
        JSON.stringify({ error: 'Supplier not found' }),
        { status: 404 }
      );
    }

    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Client not found' }),
        { status: 404 }
      );
    }

    // Check if the relationship already exists in supplier's relatedUsers
    const supplierHasClient = supplier.relatedUsers.some(
      relation => relation.user && relation.user.toString() === clientId
    );

    // Check if the relationship already exists in client's relatedUsers
    const clientHasSupplier = client.relatedUsers.some(
      relation => relation.user && relation.user.toString() === supplierId
    );

    // Update supplier if needed
    if (!supplierHasClient) {
      supplier.relatedUsers.push({
        user: clientId,
        status: 'active',
        role: 'client'
      });
      await supplier.save();
    }

    // Update client if needed
    if (!clientHasSupplier) {
      client.relatedUsers.push({
        user: supplierId,
        status: 'active',
        role: 'supplier'
      });
      await client.save();
    }

    // Return the updated supplier with populated relatedUsers
    const updatedSupplier = await User.findById(supplierId)
      .populate({
        path: 'relatedUsers.user',
        select: 'name email phone businessName clientNumber profileImage role'
      });

    return new Response(
      JSON.stringify(updatedSupplier),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding client to supplier:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
