import Navbar from "@/components/navbar/Navbar";
import { Toaster } from "@/components/ui/toaster"

export default function PagesLayout({ children }) {
  return (
    <div className="mb-24">
      <Navbar />
      <main>{children}</main>
      <Toaster />
    </div>
  );
}
