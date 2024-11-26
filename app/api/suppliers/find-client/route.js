import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function GET(req) {
  await connectToDB();

  const { query } = req.url.searchParams;
  if (!query) {
    return new Response(JSON.stringify({ error: 'Query is required' }), { status: 400 });
  }

  try {
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
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
