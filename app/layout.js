import localFont from "next/font/local";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import { UserProvider } from '@/app/context/UserContext';

import { Rubik } from 'next/font/google';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Specify the weights you intend to use
  display: 'swap', // Optional: controls font-display behavior
});
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "BClick - Manage Your Suppliers and Clients",
  description: "BClick is the ultimate platform for suppliers to manage products, categories, clients, and orders efficiently. Built for scalability and ease of use.",
  keywords: [
    "BClick",
    "Supplier Management",
    "Client Management",
    "Product Management",
    "Order Tracking",
    "Business Efficiency",
    "B2B Platform",
    "Inventory Management",
    "Supplier Dashboard",
  ],
  authors: [{ name: "Shhady Serhan" }],
  creator: "Shhady Serhan",
  openGraph: {
    title: "BClick - Efficient Supplier and Client Management",
    description: "Empower your business with BClick. Seamlessly manage your products, categories, orders, and client relationships.",
    url: "https://BClick.example.com", // Update with your domain
    siteName: "BClick",
    images: [
      {
        url: "https://sapakim.example.com/og-image.png", // Add a relevant OG image
        width: 1200,
        height: 630,
        alt: "Sapakim Platform Screenshot",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BClick - Efficient Supplier and Client Management",
    description: "Streamline your business operations with Sapakim.",
    images: ["https://sapakim.example.com/twitter-image.png"], // Add a Twitter-specific image
    site: "@your_twitter_handle", // Replace with your handle
  },
  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({ children }) {
  
  return (
    <ClerkProvider>
      <UserProvider>
    <html lang="en" dir="rtl" className="bg-[#f8f8ff]">
      <body  className={`${rubik.className} bg-[#f8f8ff]`}
> 
{/* <Navbar/> */}
        {/* <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn> */}
        {children}
      </body>
    </html>
    </UserProvider>
  </ClerkProvider>
  );
}

