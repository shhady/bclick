import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user;
    if (!sessionUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDB();

    // Prefer valid Mongo _id, otherwise fall back to email
    let query = null;
    if (sessionUser.id && mongoose.Types.ObjectId.isValid(sessionUser.id)) {
      query = { _id: sessionUser.id };
    } else if (sessionUser.email) {
      query = { email: sessionUser.email.toLowerCase() };
    }

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing user identifier' }), { status: 400 });
    }

    const user = await User.findOne(query)
      .populate({
        path: 'relatedUsers.user',
        select: 'name email phone address role profileImage coverImage businessName businessNumber area country city',
      })
      .populate({
        path: 'orders',
        select: 'status _id createdAt orderNumber total clientId supplierId',
        populate: [
          { path: 'clientId', model: 'User', select: 'businessName' },
          { path: 'supplierId', model: 'User', select: 'businessName' },
        ],
      })
      .lean();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/users/me error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}


