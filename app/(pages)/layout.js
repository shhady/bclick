import NavbarWrapper from "@/components/navbar/NavbarWrapper";
import { Toaster } from "@/components/ui/toaster";
import { NewUserProvider } from '@/app/context/NewUserContext';
import { OrdersProvider } from '@/app/context/OrdersContext';
export default function PagesLayout({ children }) {
  return (
    <NewUserProvider>
    <OrdersProvider>
    <div className="flex flex-col items-center">
      <div className="w-full">
        <NavbarWrapper />
      </div>
      <main className="w-full max-w-5xl md:pt-20 bg-[#f8f8ff] min-h-screen">
        {children}
      </main>
        <Toaster />
      </div>
    </OrdersProvider>
    </NewUserProvider>
  );
}
