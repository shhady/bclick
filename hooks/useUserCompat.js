'use client';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

/**
 * Compatibility hook to replace Clerk's useUser() on the client.
 * Exposes { user, isLoaded } similar to Clerk.
 */
export function useUserCompat() {
  const { data: session, status } = useSession();
  const isLoaded = status !== 'loading';

  const user = useMemo(() => {
    if (!session?.user) return null;
    const name = session.user.name || '';
    const firstName = name.split(' ')[0] || '';
    const email = session.user.email || '';
    return {
      id: session.user.id,
      firstName,
      emailAddresses: [{ emailAddress: email }],
      imageUrl: session.user.image,
    };
  }, [session]);

  return { user, isLoaded };
}


