import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function GET(req, { params }) {
  await connectToDB();

  const { id } = await params; // Extract the user ID from the route params

  try {
    // Find the user by ID and populate relatedUsers if necessary
    const user = await User.findById(id).populate('relatedUsers.user');

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
