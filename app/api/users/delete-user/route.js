import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function DELETE(request) {
  await connectToDB();

  try {
    const data = await request.json();
    const { id, clerkId } = data;

    if (!id && !clerkId) {
      return new Response(JSON.stringify({ error: 'Either User ID or Clerk ID is required' }), { status: 400 });
    }

    const query = id ? { _id: id } : { clerkId };
    const deletedUser = await User.findOneAndDelete(query);

    if (!deletedUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(
      JSON.stringify({ message: 'User deleted successfully', user: deletedUser }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
