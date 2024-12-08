import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function GET(req, { params }) {
  try {
    const { clerkId } = params;

    if (!clerkId) {
      return new Response(JSON.stringify({ error: 'Clerk ID is missing.' }), { status: 400 });
    }

    console.log("Received clerkId:", clerkId);

    // Connect to the database
    await connectToDB();

    // Fetch the user by clerkId
    const user = await User.findOne({ clerkId });

    console.log("Before populate:", user.relatedUsers);

    if (user) {
      await user.populate({
        path: 'relatedUsers.user',
        select: 'name email phone address role profileImage', // Specify fields to include
      });
    }

    console.log("After populate:", user.relatedUsers);

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Return the user data
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch user', details: error.message }),
      { status: 500 }
    );
  }
}
