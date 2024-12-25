import localFont from "next/font/local";
import "./globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs';
import { UserProvider } from '@/app/context/UserContext';
import { CartProvider } from '@/app/context/CartContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { heIL } from '@clerk/localizations';
import { Rubik } from 'next/font/google';
import Head from "next/head";

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
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
  description: "BClick היא הפלטפורמה המתקדמת לניהול ספקים, קטלוגים, לקוחות והזמנות בצורה יעילה ופשוטה. המערכת תוכננה לספק פתרון מקיף לעסקים בתחום ה-B2B, עם דגש על קלות שימוש והרחבה בהתאם לצרכים."
,
  manifest: '/manifest.json',

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
    description: "חזק את העסק שלך עם BClick. נהל בקלות את המוצרים, הקטגוריות, ההזמנות ומערכות היחסים עם הלקוחות שלך.",
    url: "https://bclick-umber.vercel.app/profile", // Update with your domain
    siteName: "BClick",
    images: [
      {
        url: "https://res.cloudinary.com/shhady/image/upload/v1733322054/Untitled_design_10_sotum4.png", // Add a relevant OG image
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
    <html 
      lang="he" 
      dir="rtl" 
      className={`${geistSans.variable} ${geistMono.variable} bg-[#f8f8ff]`}
    >
        <Head>
        <title>BClick - Manage Your Suppliers and Clients</title>
        <meta name="description" content="BClick היא הפלטפורמה המתקדמת לניהול ספקים..." />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body className={`${rubik.className} bg-[#f8f8ff]`}>
        <ClerkProvider localization={heIL}>
          <ErrorBoundary>
            <UserProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </UserProvider>
          </ErrorBoundary>
        </ClerkProvider>
      </body>
    </html>
  );
} 