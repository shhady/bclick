import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function GET(req, { params }) {
  const { clerkId } = await params;

  try {
    await connectToDB();

    const user = await User.findOne({ clerkId });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch user', details: error.message }),
      { status: 500 }
    );
  }
}