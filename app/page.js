import { SignOutButton, SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function Home() {
  const {user} = useUser();
    if(!user) {
      redirect('/sign-in')
    }
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <SignOutButton />
      <SignInButton/>

    </div>
  );
}
