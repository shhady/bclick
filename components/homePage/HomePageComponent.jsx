'use client';

import Advantages from '@/components/homePage/Advantages';
import AiIntegration from '@/components/homePage/AiIntegration';
import Footer from '@/components/homePage/Footer';
import StartNow from '@/components/homePage/StartNow';
import VideoInsideComputer from '@/components/homePage/VideoInsideComputer';
import { useAuth, SignInButton, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth(); // Clerk authentication
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        router.push('/profile'); // Redirect to profile if signed in
      } else {
        setLoading(false); // Stop showing the logo if no user is signed in
      }
    }
  }, [isSignedIn, isLoaded, router]);

  const userButtonAppearance = {
    elements: {
      avatarImage: 'w-100 h-100',
    },
  };

  if (loading) {
    // Display the logo while determining the user's authentication status
    return (
      <div className="h-screen flex justify-center items-center bg-white">
      <div className="relative w-[200px] h-[200px] flex justify-center items-center animate-pulse">
        <Image
         src="/bclick-logo.jpg"
         alt="logo"
         fill
         className="object-contain"
         priority
         sizes="200px"
        />
      </div>
    </div>
    );
  }

  return (
    <>
      <div className="pb-48 bg-gradient-to-b from-[#D732A8] to-[#034167] text-white">
        {/* Navigation */}
        <nav className="flex justify-between items-start pr-4 py-4" dir="ltr">
          {/* Logo and Title */}
          <div className="flex items-start gap-2">
          <div className="relative w-[70px] h-[70px]">
    <Image
      src="/home-logo.png"
      alt="logo"
      fill
      className="object-contain"
      priority
       sizes="70px"
    />
  </div>
            <div>
              <h2 className="text-white text-2xl">BClick</h2>
              <h2 className="text-white text-sm md:text-2xl pr-6">
                Your Business Order, One Click
              </h2>
            </div>
          </div>
          {/* Authentication Buttons */}
          <div className="flex gap-4">
            {isSignedIn ? (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <button
                    style={{
                      background: '#3997D3',
                      border: '1px solid white',
                      borderRadius: '5px',
                      height: '36px',
                      width: '95px',
                      color: 'white',
                    }}
                  >
                    פרופיל
                  </button>
                </Link>
                <UserButton
                  style={{ height: '48px', width: '48px' }}
                  aftersignouturl="/"
                  appearance={userButtonAppearance}
                />
              </div>
            ) : (
              <SignInButton
                style={{
                  background: '#3997D3',
                  border: '1px solid white',
                  borderRadius: '5px',
                  height: '36px',
                  width: '95px',
                  color: 'white',
                }}
              >
                התחבר
              </SignInButton>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex flex-col justify-center items-center mt-16">
          <h2 className="text-4xl font-bold text-center mb-6 px-4">
            BClick המערכת לניהול הזמנות לעסקים B2B
          </h2>
          <p className="text-center text-lg mb-10 p-3">
            הדרך החכמה, הנוחה והפשוטה לנהל קטלוג מוצרים ולהזמין בקליק.
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <Link
              href={'/sign-up'}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg w-full font-medium hover:bg-blue-600"
            >
              <button className="w-full">התחל</button>
            </Link>
            <div
              className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-300"
              onClick={() => console.log('View video')}
            >
              צפה בווידאו
            </div>
          </div>
        </main>
      </div>
      <VideoInsideComputer />
      <Advantages />
      <AiIntegration />
      <StartNow />
      <Footer />
    </>
  );
}
