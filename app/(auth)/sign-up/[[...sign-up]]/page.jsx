import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return <div dir='ltr'className='h-[90vh] mt-10  w-full flex justify-center items-center'>
     <SignUp fallbackRedirectUrl="/newprofile"/></div>;
}