import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function PUT(request) {
  await connectToDB();

  try {
    const data = await request.json();
    const { clerkId, ...updateData } = data; // Use `clerkId` to identify the user
    const updatedUser = await User.findOneAndUpdate({ clerkId }, updateData, { new: true });

    if (!updatedUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(
      JSON.stringify({ message: 'User updated successfully', user: updatedUser }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}