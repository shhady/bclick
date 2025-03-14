import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div dir='ltr' className='h-[90vh] w-full flex flex-col gap-10 justify-center items-center'>
      <SignIn fallbackRedirectUrl="/newprofile" />
    </div>
  );
}