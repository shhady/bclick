import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function DELETE(request) {
  await connectToDB();

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id'); // Get the user ID from query params

    if (!id) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(id);

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
