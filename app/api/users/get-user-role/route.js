// pages/api/getUserRole.js

import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

export default async function getUserRole(req, res) {
  if (req.method === 'GET') {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const user = await clerkClient.users.getUser(userId);
      const userRole = user.publicMetadata.role || 'No role assigned';
      return res.status(200).json({ role: userRole });
    } catch (error) {
      console.error('Error fetching user role:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
