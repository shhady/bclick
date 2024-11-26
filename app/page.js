import { SignOutButton, SignInButton } from "@clerk/nextjs";
import Image from "next/image";

export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const response = await fetch(`${baseUrl}/api/users/get-users`, {
    cache: 'no-store', // Ensure fresh data is fetched
  });
  let users = await response.json();
  console.log(users);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <SignOutButton />
      <SignInButton/>

    </div>
  );
}
