import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function PUT(req) {
  await connectToDB();

  try {
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return new Response(JSON.stringify({ error: 'User ID and role are required' }), { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(
      JSON.stringify({ message: 'User role updated successfully', user: updatedUser }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user role:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
