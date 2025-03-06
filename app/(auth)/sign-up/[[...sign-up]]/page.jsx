import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return <div dir='ltr'className='h-[90vh]  w-full flex justify-center items-center'>
     <SignUp forceRedirectUrl="/newprofile"/></div>;
}