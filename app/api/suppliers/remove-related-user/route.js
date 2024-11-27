import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function DELETE(req) {
  try {
    const { supplierId, clientId } = await req.json();

    if (!supplierId || !clientId) {
      return new Response(JSON.stringify({ error: 'Supplier ID and Client ID are required.' }), {
        status: 400,
      });
    }

    await connectToDB();

    // Remove the client from the supplier's relatedUsers
    await User.findByIdAndUpdate(
      supplierId,
      { $pull: { relatedUsers: { user: clientId } } },
      { new: true }
    );

    // Remove the supplier from the client's relatedUsers
    await User.findByIdAndUpdate(
      clientId,
      { $pull: { relatedUsers: { user: supplierId } } },
      { new: true }
    );

    return new Response(JSON.stringify({ message: 'Client removed successfully.' }), { status: 200 });
  } catch (error) {
    console.error('Error removing related user:', error);
    return new Response(JSON.stringify({ error: 'Failed to remove client from relatedUsers.' }), {
      status: 500,
    });
  }
}
