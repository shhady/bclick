import { connectToDB } from '@/utils/database';
import User from '@/models/user';
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const { identifier } = await params;
    if (!identifier) {
      return new Response(JSON.stringify({ error: 'Identifier is missing.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    await connectToDB();

    let query = {};
    if (identifier.includes('@')) {
      query = { email: identifier.toLowerCase() };
    } else {
      query = { _id: identifier };
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
          { path: 'supplierId', model: 'User', select: 'businessName' }
        ]
      });

    if (!user) {
      return new Response(JSON.stringify({ 
        error: 'User not found',
        message: `No user found with identifier: ${identifier}` 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const userData = JSON.parse(JSON.stringify(user));
    return new Response(JSON.stringify(userData), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
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


