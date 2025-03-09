import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import { currentUser } from '@clerk/nextjs/server';
import BusinessCardClient from './BusinessCardClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  await connectToDB();
  const { businessName } = await params;
  
  // Fetch the profile user details
  const profileUser = await User.findOne({ businessName })
    .select('name businessName')
    .lean();
  
  if (!profileUser) {
    return {
      title: 'כרטיס ביקור לא נמצא',
      description: 'כרטיס הביקור שחיפשת אינו קיים או שהוסר.'
    };
  }
  
  return {
    title: `${profileUser.name} | ${profileUser.businessName || 'כרטיס ביקור'}`,
    description: `כרטיס ביקור של ${profileUser.name}${profileUser.businessName ? ` - ${profileUser.businessName}` : ''}`,
    openGraph: {
      title: `${profileUser.name} | ${profileUser.businessName || 'כרטיס ביקור'}`,
      description: `כרטיס ביקור של ${profileUser.name}${profileUser.businessName ? ` - ${profileUser.businessName}` : ''}`,
    }
  };
}

export default async function BusinessCardPage({ params }) {
  await connectToDB();
  const { businessName } = await params;
  
  // Get the current user from Clerk
  const user = await currentUser();
  const clerkId = user?.id;
  
  // Fetch the viewer from our database to get their role and ID
  const dbViewer = clerkId ? await User.findOne({ clerkId }).lean() : null;
  const viewerRole = dbViewer?.role || 'guest'; // Default to guest if not found
  const viewerId = dbViewer?._id?.toString();
  
  // Fetch the profile user details by businessName
  const profileUser = await User.findOne({ businessName })
    .select('name email phone address logo coverImage profileImage businessName city country role relatedUsers area')
    .lean();
  
  if (!profileUser) {
    return notFound();
  }
  
  // Check if the viewer is already related to the profile user
  let isRelated = false;
  if (viewerRole === 'supplier' && viewerId && profileUser.role === 'client') {
    isRelated = dbViewer.relatedUsers?.some(
      relation => relation.user?.toString() === profileUser._id.toString()
    );
  } else if (viewerRole === 'client' && viewerId && profileUser.role === 'supplier') {
    isRelated = profileUser.relatedUsers?.some(
      relation => relation.user?.toString() === viewerId
    );
  }
  
  // Serialize the data
  const serializedProfileUser = serializeUser(profileUser);
  const serializedViewer = dbViewer ? serializeUser(dbViewer) : null;
  
  return (
    <BusinessCardClient 
      profileUser={serializedProfileUser}
      viewer={{
        id: viewerId,
        role: viewerRole,
        isRelated
      }}
    />
  );
}

// Helper function to serialize user data
function serializeUser(user) {
  if (!user) return null;
  
  return {
    ...user,
    _id: user._id?.toString() || '',
    relatedUsers: user.relatedUsers?.map((relUser) => ({
      ...relUser,
      _id: relUser._id?.toString() || '',
      user: relUser.user?.toString() || '',
      status: relUser.status || 'active'
    })) || [],
    createdAt: user.createdAt?.toISOString() || null,
    updatedAt: user.updatedAt?.toISOString() || null,
  };
} 