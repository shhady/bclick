import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function PUT(request) {
  await connectToDB();

  try {
    const data = await request.json();
    const { clerkId, profileImage } = data;
    
    
    if (!clerkId) {
      return new Response(JSON.stringify({ error: 'Clerk ID is required' }), { status: 400 });
    }
    
    if (!profileImage) {
      return new Response(JSON.stringify({ error: 'Profile image is required' }), { status: 400 });
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { $set: { profileImage } },
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
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }
    

    return new Response(
      JSON.stringify(updatedUser),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating profile image:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
} 