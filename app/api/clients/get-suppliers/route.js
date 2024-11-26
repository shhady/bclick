import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function GET(req, { params }) {
  await connectToDB();

  try {
    const url = new URL(req.url);
    const clientId = url.searchParams.get('clientId'); // Fetch the clientId from query params

    if (!clientId) {
      return new Response(JSON.stringify({ error: 'Client ID is required' }), { status: 400 });
    }

    // Find the client by ID
    const client = await User.findById(clientId).lean();

    if (!client || !client.relatedUsers) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Filter active suppliers and fetch their details
    const activeSuppliers = await Promise.all(
      client.relatedUsers
        .filter((rel) => rel.status === 'active') // Only active suppliers
        .map(async (rel) => {
          const supplier = await User.findById(rel.user).lean();
          return {
            _id: supplier._id,
            name: supplier.name,
            businessName: supplier.businessName,
            email: supplier.email,
            phone: supplier.phone,
            profileImage: supplier.profileImage
          };
        })
    );

    return new Response(JSON.stringify(activeSuppliers), { status: 200 });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
