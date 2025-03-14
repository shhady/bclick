import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function GET(req) {
  await connectToDB();

  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    
    // Get all users with their phone numbers
    const users = await User.find()
      .select('_id name email phone role')
      .limit(100)
      .lean();
    
    // If a specific phone was requested, filter and show details
    if (phone) {
      const normalizedPhone = phone.replace(/\D/g, '');
      const matchingUsers = users.filter(user => {
        if (!user.phone) return false;
        const normalizedUserPhone = user.phone.replace(/\D/g, '');
        return normalizedUserPhone.includes(normalizedPhone) || 
               normalizedPhone.includes(normalizedUserPhone);
      });
      
      return new Response(JSON.stringify({
        query: phone,
        normalizedQuery: normalizedPhone,
        count: matchingUsers.length,
        users: matchingUsers
      }), { status: 200 });
    }
    
    // Return all phone numbers for analysis
    const phoneDetails = users.map(user => ({
      id: user._id,
      name: user.name,
      phone: user.phone,
      normalizedPhone: user.phone ? user.phone.replace(/\D/g, '') : null,
      role: user.role
    }));
    
    return new Response(JSON.stringify({
      count: users.length,
      phoneDetails
    }), { status: 200 });
    
  } catch (error) {
    console.error('Error in debug phone API:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
} 