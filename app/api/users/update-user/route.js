import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function PUT(request) {
  await connectToDB();

  try {
    const data = await request.json();
    const { clerkId, ...updateData } = data; // Use `clerkId` to identify the user
    
    
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { $set: updateData }, // Dynamically update provided fields
      { new: true } // Return the updated document
    ).populate({
      path: 'relatedUsers.user',
      select: 'name email phone address role profileImage coverImage businessName businessNumber area country city', // Include all necessary fields
    })
    .populate({
      path: 'orders', // Populate orders array
      select: 'status _id createdAt', // Include creation date for sorting
    })
    .lean();

    if (!updatedUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }
    
    
    // Check if relatedUsers have coverImage
    if (updatedUser.relatedUsers && updatedUser.relatedUsers.length > 0) {
      
      // Log a sample of the first related user's data
      if (updatedUser.relatedUsers[0].user) {
        const sampleUser = updatedUser.relatedUsers[0].user;
       
      }
    }

    return new Response(
      JSON.stringify(updatedUser),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}
