'use client';

import { Facebook, Instagram } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#D732A8] to-[#034167] text-white py-10 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo and Description */}
        <div className="flex flex-col items-start">
          <Image src="/home-logo.png" alt="BClick Logo" width={80} height={80} />
          <h3 className="text-2xl font-bold mt-4">BClick</h3>
          <p className="mt-2 text-sm">
            המערכת המתקדמת לניהול הזמנות לעסקים B2B. כל מה שצריך לניהול ספקים ולקוחות במקום אחד.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xl font-semibold mb-4">קישורים מהירים</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/aboutUs" className="hover:text-gray-300">
                אודות
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" className="hover:text-gray-300">
                תנאים והגבלות
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-gray-300">
                מדיניות פרטיות
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Information */}
        <div>
          <h4 className="text-xl font-semibold mb-4">תמיכה</h4>
          <ul className="space-y-2">
            <li>אימייל: <a href="mailto:support@bclick.com" className="hover:text-gray-300">support@bclick.com</a></li>
            <li>טלפון: <a href="tel:+972123456789" className="hover:text-gray-300">+972 123-456-789</a></li>
            <li>כתובת: שדרות הטכנולוגיה 15, חיפה</li>
          </ul>
        </div>

        {/* Social Media Links */}
        <div>
          <h4 className="text-xl font-semibold mb-4">עקוב אחרינו</h4>
          <div className="flex space-x-4">
            <Link href="https://facebook.com" target="_blank" className="hover:text-gray-300">
            <Facebook />
              {/* <Image src="/facebook-icon.svg" alt="Facebook" width={24} height={24} /> */}
            </Link>
            {/* <Link href="https://twitter.com" target="_blank" className="hover:text-gray-300">
              <Image src="/twitter-icon.svg" alt="Twitter" width={24} height={24} />
            </Link> */}
            <Link href="https://instagram.com" target="_blank" className="hover:text-gray-300">
            <Instagram/>
              {/* <Image src="/instagram-icon.svg" alt="Instagram" width={24} height={24} /> */}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} BClick. כל הזכויות שמורות.</p>
      </div>
    </footer>
  );
}
