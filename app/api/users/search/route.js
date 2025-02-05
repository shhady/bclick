import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function GET(req) {
  await connectToDB();

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const role = searchParams.get('role'); // Optional role filter
    const excludeId = searchParams.get('excludeId'); // Optional ID to exclude from results

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), { status: 400 });
    }

    // Build search criteria
    const searchCriteria = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { businessName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { clientNumber: isNaN(query) ? undefined : parseInt(query) }
      ].filter(Boolean)
    };

    // Add role filter if provided
    if (role) {
      searchCriteria.role = role;
    }

    // Exclude specific ID if provided
    if (excludeId) {
      searchCriteria._id = { $ne: excludeId };
    }

    // Find users with pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(searchCriteria)
        .select('-__v -relatedUsers -orders -products') // Exclude unnecessary fields
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(searchCriteria)
    ]);

    return new Response(
      JSON.stringify({
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + users.length < total
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in search users API:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
} 