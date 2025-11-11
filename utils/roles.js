import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export const checkRole = async (role) => {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return false;

  await connectToDB();
  const dbUser = await User.findOne({ email }).select('role').lean();
  return dbUser?.role === role;
};