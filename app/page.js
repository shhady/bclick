'use client';

import { useAuth, SignInButton, SignOutButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  const { isSignedIn } = useAuth();
  const userButtonAppearance = {
    elements: {
      avatarImage: 'w-100 h-100', // Adjust these classes as needed
    },
  };
  return (
    <div className="grid  items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      {isSignedIn ? (
        <>
          <UserButton afterSignOutUrl="/"  appearance={userButtonAppearance}/>
          
          <Link href={'/profile'}>
            <button         className="w-full p-2 max-w-screen-lg mt-4 inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#303030,45%,white,55%,#303030)] bg-[length:200%_100%] px-6 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
>
            פרופיל
            </button>
            
          </Link>
          <SignOutButton />
        </>
      ) : (
        <SignInButton />
      )}
    </div>
  );
}
