import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function GET() {
  await connectToDB();

  try {
    const totalUsers = await User.countDocuments(); // Count all users in the database
    return new Response(JSON.stringify({ totalUsers }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
