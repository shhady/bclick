import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function GET(req) {
  await connectToDB();

  try {
    const { searchParams } = new URL(req.url); // Parse URL for searchParams
    const query = searchParams.get('query'); // Get the 'query' parameter

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), { status: 400 });
    }

    // Search for a client by name, business name, email, or phone
    const client = await User.findOne({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { businessName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ],
    });

    if (!client) {
      return new Response(JSON.stringify({ error: 'Client not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(client), { status: 200 });
  } catch (error) {
    console.error('Error in find-client API:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
