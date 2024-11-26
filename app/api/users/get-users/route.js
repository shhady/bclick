import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  await connectToDB();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page')) || 1; // Default to page 1 if not provided
  const limit = parseInt(url.searchParams.get('limit')) || 10; // Default to 10 items per page
  const filter = url.searchParams.get('filter') || ''; // Get filter parameter

  const skip = (page - 1) * limit;

  try {
    // Build the filter criteria
    const filterCriteria = filter
      ? {
          $or: [
            { name: { $regex: filter, $options: 'i' } },
            { email: { $regex: filter, $options: 'i' } },
            { phone: { $regex: filter, $options: 'i' } },
          ],
        }
      : {};

    // Query the database with filtering and pagination
    const users = await User.find(filterCriteria)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalUsers = await User.countDocuments(filterCriteria); // Get the total number of filtered users

    return new Response(
      JSON.stringify({
        users,
        totalUsers,
        page,
        totalPages: Math.ceil(totalUsers / limit),
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
