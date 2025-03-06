import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function GET(req, { params }) {
  try {
    const { clerkId } = await params; // Access clerkId from dynamic route params

    if (!clerkId) {
      return new Response(JSON.stringify({ error: 'Clerk ID is missing.' }), { status: 400 });
    }

    console.log(`API: Fetching user data for clerkId: ${clerkId}`);

    // Connect to the database
    await connectToDB();

    // Fetch the user by clerkId with complete population
    const user = await User.findOne({ clerkId })
      .populate({
        path: 'relatedUsers.user',
        // Include all fields needed for supplier display
        select: 'name email phone address role profileImage coverImage businessName businessNumber area country city',
      })
      .populate({
        path: 'orders', // Populate orders array
        select: 'status _id createdAt', // Include creation date for sorting
      })
      .lean();

    if (!user) {
      console.log(`API: User not found for clerkId: ${clerkId}`);
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Log the populated data for debugging
    console.log(`API: Successfully fetched user data for: ${user.name}`);
    
    // Check if relatedUsers have coverImage
    if (user.relatedUsers && user.relatedUsers.length > 0) {
      console.log(`API: User has ${user.relatedUsers.length} related users`);
      
      // Log a sample of the first related user's data
      if (user.relatedUsers[0].user) {
        const sampleUser = user.relatedUsers[0].user;
        console.log(`API: Sample related user - ${sampleUser.businessName}`);
        console.log(`API: Sample related user has coverImage: ${sampleUser.coverImage ? 'Yes' : 'No'}`);
      }
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
