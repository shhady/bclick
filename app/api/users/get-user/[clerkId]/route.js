import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function GET(req, { params }) {
  try {
    const { clerkId } = await params; // Access clerkId from dynamic route params

    if (!clerkId) {
      return new Response(JSON.stringify({ error: 'Clerk ID is missing.' }), { status: 400 });
    }


    // Connect to the database
    await connectToDB();

    // Fetch the user by clerkId
    const user = await User.findOne({ clerkId })
      .populate({
        path: 'relatedUsers.user',
        select: 'name email phone address role profileImage', // Populate related users
      })
      .populate({
        path: 'orders', // Populate orders array
        select: 'status _id', // Fetch only the status and _id fields
      })
      .lean();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }


    // Return the populated user data
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch user', details: error.message }),
      { status: 500 }
    );
  }
}
