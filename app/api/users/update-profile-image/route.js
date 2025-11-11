import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function PUT(request) {
  await connectToDB();

  try {
    const data = await request.json();
    const { email, _id, profileImage } = data;
    
    
    if (!email && !_id) {
      return new Response(JSON.stringify({ error: 'Email or _id is required' }), { status: 400 });
    }
    
    if (!profileImage) {
      return new Response(JSON.stringify({ error: 'Profile image is required' }), { status: 400 });
    }

    const filter = email ? { email: email.toLowerCase() } : { _id };
    const updatedUser = await User.findOneAndUpdate(
      filter,
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