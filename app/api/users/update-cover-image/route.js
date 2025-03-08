import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function PUT(request) {
  await connectToDB();

  try {
    const data = await request.json();
    const { clerkId, coverImage } = data;
    
    
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
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }
    
    return new Response(
      JSON.stringify(updatedUser),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
} 