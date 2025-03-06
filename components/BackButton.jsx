"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/profile" || pathname === "/newprofile") return null;
  if (pathname === "/") return null;
  // Define paths where the back button should NOT be shown
  const hiddenPaths = ["/profile", "/orders"];

  // Check if the current path is one of the hidden paths
  const shouldHideButton =
    hiddenPaths.includes(pathname) || 
    pathname.startsWith("/supplier/") && pathname.endsWith("/catalog") ||    pathname.startsWith("/supplier/") && pathname.endsWith("/clients") 

  if (shouldHideButton) return <div className="bg-gray-300 border-b border-gray-300 h-12 flex justify-start items-center px-4 md:hidden sticky top-0 left-0 w-full z-50"></div>;

  return (
    <div className="bg-gray-300 h-12 flex justify-start items-center px-4 md:hidden sticky top-0 left-0 w-full z-50">
      <button 
        className="text-gray-800" 
        onClick={() => router.back()}
      >
        <ArrowRight />
      </button>
    </div>
  );
}
