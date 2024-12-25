import localFont from "next/font/local";
import { ClerkProvider } from '@clerk/nextjs';
import { UserProvider } from '@/app/context/UserContext';
import { CartProvider } from '@/app/context/CartContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { heIL } from '@clerk/localizations';
import { Rubik } from 'next/font/google';
import Head from "next/head";
import "./globals.css";

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
  metadataBase: new URL('https://bclick-umber.vercel.app'),
  title: {
    default: 'BClick - ניהול ספקים ולקוחות',
    template: '%s | BClick'
  },
  description: 'BClick היא הפלטפורמה המתקדמת לניהול ספקים, קטלוגים, לקוחות והזמנות',
  keywords: ['ניהול ספקים', 'ניהול לקוחות', 'B2B', 'קטלוג דיגיטלי'],
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: 'https://bclick-umber.vercel.app',
    siteName: 'BClick',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'BClick Platform Preview',
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BClick - Efficient Supplier and Client Management",
    description: "Streamline your business operations with BClick.",
    images: ["https://bclick-umber.vercel.app/twitter-image.png"], 
    site: "@your_twitter_handle", 
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'your-google-verification-code',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="he" 
      dir="rtl" 
      className={`${geistSans.variable} ${geistMono.variable} bg-[#f8f8ff]`}
    >
      <Head>
        <title>{metadata.title.default}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords.join(', ')} />
        <meta name="robots" content="index, follow" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href={metadata.manifest} />
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
