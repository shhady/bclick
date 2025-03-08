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
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Log the populated data for debugging
    
    // Check if relatedUsers have coverImage
    if (user.relatedUsers && user.relatedUsers.length > 0) {
      
      // Log a sample of the first related user's data
      if (user.relatedUsers[0].user) {
        const sampleUser = user.relatedUsers[0].user;
   
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
