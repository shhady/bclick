import { connectToDB } from '@/utils/database';
import User from '@/models/user';
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const { clerkId } = await params;

    if (!clerkId) {
      return new Response(JSON.stringify({ error: 'Clerk ID is missing.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    console.log(`API: Fetching user data for clerkId: ${clerkId}`);

    // Connect to the database
    await connectToDB();

    // Fetch the user with fully populated data
    const user = await User.findOne({ clerkId })
      .populate({
        path: 'relatedUsers.user',
        select: 'name email phone address role profileImage coverImage businessName businessNumber area country city',
      })
      .populate({
        path: 'orders',
        select: 'status _id createdAt orderNumber total clientId supplierId',
        populate: [
          { path: 'clientId', model: 'User', select: 'businessName' }, // Ensure correct model reference
          { path: 'supplierId', model: 'User', select: 'businessName' }
        ]
      });

    if (!user) {
      console.error(`API: User not found for clerkId: ${clerkId}`);
      return new Response(JSON.stringify({ 
        error: 'User not found',
        message: `No user found with Clerk ID: ${clerkId}` 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Convert to plain JSON-safe format
    const userData = JSON.parse(JSON.stringify(user));
    console.log(`API: Successfully fetched user data for ${clerkId}`);

    return new Response(JSON.stringify(userData), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('API Error fetching user:', error.message);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch user', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
