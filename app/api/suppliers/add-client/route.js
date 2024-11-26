import { connectToDB } from '@/utils/database';
import mongoose from 'mongoose';
import User from '@/models/user';

export async function POST(req) {
  await connectToDB();

  try {
    const { supplierId, clientId } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(supplierId) || !mongoose.Types.ObjectId.isValid(clientId)) {
      return new Response(JSON.stringify({ error: 'Invalid IDs provided' }), { status: 400 });
    }

    const supplier = await User.findById(supplierId);
    const client = await User.findById(clientId);

    if (!supplier || !client) {
      return new Response(
        JSON.stringify({ error: 'Supplier or Client not found' }),
        { status: 404 }
      );
    }

    // Add client to supplier's relatedUsers
    if (!supplier.relatedUsers.some((rel) => rel.user.toString() === clientId)) {
      supplier.relatedUsers.push({
        user: new mongoose.Types.ObjectId(clientId),
        status: 'active',
      });
    }

    // Add supplier to client's relatedUsers
    if (!client.relatedUsers.some((rel) => rel.user.toString() === supplierId)) {
      client.relatedUsers.push({
        user: new mongoose.Types.ObjectId(supplierId),
        status: 'active',
      });
    }

    await supplier.save();
    await client.save();

    return new Response(
      JSON.stringify({ message: 'Client successfully added', supplier, client }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
