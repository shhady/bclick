'use client';
import { NewUserProvider } from "@/app/context/NewUserContext";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";

export default function CartLayout({ children }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewUserProvider>
        <div className="flex flex-col items-center">
          <main className="w-full max-w-5xl bg-[#f8f8ff] min-h-screen">
          {children}
        </main>
        <Toaster />
      </div>
      </NewUserProvider>
    </Suspense>
  );
} 