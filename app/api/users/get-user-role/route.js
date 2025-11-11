import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export default async function getUserRole(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  const email = session?.user?.email;
  if (!email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await connectToDB();
    const user = await User.findOne({ email }).select('role').lean();
    const userRole = user?.role || 'No role assigned';
    return res.status(200).json({ role: userRole });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
