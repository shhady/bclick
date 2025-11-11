import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function GET(req) {
  await connectToDB();

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');
    const authId = searchParams.get('authId');
    
    let query = {};
    
    if (email) {
      query.email = email;
    } else if (id) {
      query._id = id;
    } else if (authId) {
      query.authId = authId;
    } else {
      // If no specific query, return first 10 users for debugging
      const users = await User.find().limit(10).select('_id name email phone authId role').lean();
      return new Response(JSON.stringify({ 
        message: 'Showing first 10 users',
        count: users.length,
        users 
      }), { status: 200 });
    }
    
    // Find the user with the exact query
    const user = await User.findOne(query).lean();
    
    if (!user) {
      // If exact match fails, try a more flexible search for email
      if (email) {
        // Try case-insensitive search
        const flexibleUsers = await User.find({ 
          email: { $regex: email, $options: 'i' } 
        }).select('_id name email phone authId role').lean();
        
        return new Response(JSON.stringify({
          message: 'No exact match found, but found similar emails',
          count: flexibleUsers.length,
          users: flexibleUsers
        }), { status: 200 });
      }
      
      return new Response(JSON.stringify({ 
        message: 'User not found',
        query
      }), { status: 404 });
    }
    
    return new Response(JSON.stringify({
      message: 'User found',
      user
    }), { status: 200 });
    
  } catch (error) {
    console.error('Error in debug API:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
} 