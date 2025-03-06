'use client';
import { NewUserProvider } from "@/app/context/NewUserContext";
import { Toaster } from "@/components/ui/toaster";

export default function NewProfileLayout({ children }) {
  return (
    <NewUserProvider>
      <div className="flex flex-col items-center">
        <main className="w-full max-w-5xl  bg-[#f8f8ff] min-h-screen">
          {children}
        </main>
        <Toaster />
      </div>
    </NewUserProvider>
  );
} 