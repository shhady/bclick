import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function PUT(request) {
  await connectToDB();

  try {
    const data = await request.json();
    const { clerkId, coverImage } = data;
    
    console.log(`Update Cover Image API: Updating user with clerkId: ${clerkId}`);
    
    if (!clerkId) {
      return new Response(JSON.stringify({ error: 'Clerk ID is required' }), { status: 400 });
    }
    
    if (!coverImage || !coverImage.secure_url) {
      return new Response(JSON.stringify({ error: 'Cover image with secure_url is required' }), { status: 400 });
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { $set: { coverImage } },
      { new: true }
    ).populate({
      path: 'relatedUsers.user',
      select: 'name email phone address role profileImage coverImage businessName businessNumber area country city',
    })
    .populate({
      path: 'orders',
      select: 'status _id createdAt',
    })
    .lean();

    if (!updatedUser) {
      console.log(`Update Cover Image API: User not found for clerkId: ${clerkId}`);
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }
    
    console.log(`Update Cover Image API: Successfully updated cover image for user: ${updatedUser.name}`);

    return new Response(
      JSON.stringify(updatedUser),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating cover image:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
} 