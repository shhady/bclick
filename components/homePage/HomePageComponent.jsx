'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function HomePageComponent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState({
    hero: false,
    features: false,
    catalog: false,
    mobile: false,
    clients: false,
    reports: false,
    pricing: false
  });
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Refs for sections
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const catalogRef = useRef(null);
  const mobileRef = useRef(null);
  const clientsRef = useRef(null);
  const reportsRef = useRef(null);
  const pricingRef = useRef(null);

  // Handle user authentication and redirect
  useEffect(() => {
    if (isLoaded && user) {
      setIsRedirecting(true);
      router.push('/newprofile');
    }
  }, [user, isLoaded, router]);

  // Handle scroll events
  useEffect(() => {
    if (isLoaded && !user && !isRedirecting) {
      const handleScroll = () => {
        // Navbar background change on scroll
        if (window.scrollY > 50) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }

        // Check if sections are in viewport
        const isInViewport = (element) => {
          if (!element) return false;
          const rect = element.getBoundingClientRect();
          return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
          );
        };

        // Update visible sections
        setVisibleSections({
          hero: isInViewport(heroRef.current),
          features: isInViewport(featuresRef.current),
          catalog: isInViewport(catalogRef.current),
          mobile: isInViewport(mobileRef.current),
          clients: isInViewport(clientsRef.current),
          reports: isInViewport(reportsRef.current),
          pricing: isInViewport(pricingRef.current)
        });
      };

      // Initial check
      handleScroll();

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isLoaded, user, isRedirecting]);

  // Show loading state until we know if user is authenticated
  if (!isLoaded || isRedirecting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Image 
            src="/bclick-logo.jpg" 
            alt="BClick Logo" 
            width={150} 
            height={150} 
            className="mx-auto mb-6"
          />
          {/* <div className="mt-4 text-gray-600">טוען...</div> */}
        </div>
      </div>
    );
  }

  // If user is loaded and not authenticated, show the homepage
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-customBlue">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <Image 
                  src="/bclick-logo.jpg" 
                  alt="BClick Logo" 
                  width={100} 
                  height={50} 
                  className="w-auto object-contain"
                />
              </Link>
            </div>
            
            {/* Login Button (both desktop and mobile) */}
            <div>
              <Link href="/sign-in" className="bg-customBlue hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors duration-300">
                התחברות
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className={`pt-32 pb-20 px-4 transition-all duration-700 transform ${
          visibleSections.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pl-10 text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              <span className="text-customBlue">BClick</span> המערכת לניהול הזמנות לעסקים <span className="text-customBlue">B2B</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              הדרך החכמה, המהירה והפשוטה לנהל קטלוג מוצרים ולהזמין בקליק
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center md:justify-end space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
              <Link href="/sign-up" className="bg-customBlue hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium text-lg transition-colors duration-300 shadow-lg hover:shadow-xl">
                התחל עכשיו
              </Link>
              <a href="#how-it-works" className="bg-white hover:bg-gray-100 text-customBlue px-8 py-3 rounded-full font-medium text-lg transition-colors duration-300 border border-blue-200 shadow-md hover:shadow-lg">
                איך זה עובד
              </a>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-200 rounded-lg transform rotate-3"></div>
              <div className="relative bg-white p-4 rounded-lg shadow-2xl border border-gray-200">
                <Image 
                  src="/homebclick.png" 
                  alt="BClick Dashboard" 
                  width={700} 
                  height={400}
                  className="rounded-md w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        id="how-it-works"
        className={`py-20 bg-gradient-to-b from-blue-50 to-white transition-all duration-700 transform ${
          visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              המערכת שמחברת ספקים ולקוחות
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              בממשק ידידותי, חוסכת זמן, ומביאה את העסק שלך קדימה
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`bg-white p-6 rounded-xl shadow-lg transition-all duration-700 delay-100 transform ${
              visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-customBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3 text-center md:text-right">ניהול קטלוג בקלות</h3>
              <p className="text-gray-600 text-center md:text-right">
                ספקים יכולים להעלות קטלוג מוצרים מפורט, לעדכן מחירים, ותמונות תוך דקות.
              </p>
            </div>
            
            <div className={`bg-white p-6 rounded-xl shadow-lg transition-all duration-700 delay-200 transform ${
              visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3 text-center md:text-right">הזמנות פשוטות ומהירות</h3>
              <p className="text-gray-600 text-center md:text-right">
                לקוחות יכולים לבצע הזמנות בקלות, לעקוב אחר סטטוס ההזמנה ולצפות בהיסטוריית הזמנות.
              </p>
            </div>
            
            <div className={`bg-white p-6 rounded-xl shadow-lg transition-all duration-700 delay-300 transform ${
              visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3 text-center md:text-right">ניתוח נתונים חכם</h3>
              <p className="text-gray-600 text-center md:text-right">
                קבלו תובנות עסקיות חשובות באמצעות דו&quot;חות מפורטים וניתוח מגמות מכירה.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section 
        ref={catalogRef}
        className={`py-20 bg-white transition-all duration-700 transform ${
          visibleSections.catalog ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">ניהול קטלוג בקלות</h2>
              <p className="text-xl text-gray-600 mb-8">
                ספקים יכולים להעלות קטלוג מוצרים מפורט, לעדכן מחירים, מלאי ותמונות תוך דקות. המערכת מאפשרת ניהול קטגוריות, מחירונים מותאמים ללקוחות ספציפיים, ועוד.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-customBlue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">העלאת מוצרים בודדים או המונית</span>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-customBlue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">ניהול מחירונים מותאמים</span>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-customBlue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">עדכון מלאי בזמן אמת</span>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-customBlue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">ארגון מוצרים בקטגוריות</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white p-4 rounded-lg shadow-2xl border border-gray-200">
                <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-100">
                  <div className="font-medium text-gray-600">שם מוצר</div>
                  <div className="font-medium text-gray-600">יחידות באריזה</div>
                  <div className="font-medium text-gray-600">משקל יחידה</div>
                  {/* <div className="font-medium text-gray-600">מלאי</div> */}
                  <div className="font-medium text-gray-600">מחיר</div>
                </div>
                {[1, 2, 3, 4, 5].map((item, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-100">
                    <div className="font-medium">מוצר {item}</div>
                    <div>12</div>
                    <div>250 גרם</div>
                    {/* <div className="text-green-600">במלאי</div> */}
                    <div className="font-bold">₪{(75 + item * 10).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Support Section */}
      <section 
        ref={mobileRef}
        className={`py-20 bg-gradient-to-b from-white to-blue-50 transition-all duration-700 transform ${
          visibleSections.mobile ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              תמיכה במובייל ובדסקטופ
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              גישה מכל מכשיר, בכל זמן
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <div className="relative mx-auto w-64 h-[500px] bg-black rounded-[36px] shadow-xl overflow-hidden border-[14px] border-black">
                <div className="absolute top-0 w-full h-[32px] bg-black">
                  <div className="absolute top-[10px] left-1/2 transform -translate-x-1/2 w-[100px] h-[4px] bg-gray-800 rounded-full"></div>
                </div>
                <div className="w-full h-full bg-white overflow-hidden">
                  <Image 
                    src="/mobilehomepage.png" 
                    alt="BClick Mobile App" 
                    width={400} 
                    height={800}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">חסכון בזמן ובעלויות</h3>
              <p className="text-xl text-gray-600 mb-8">
                כל תהליך ההזמנה מרוכז במקום אחד. גישה מכל מכשיר מאפשרת לך לנהל את העסק שלך מכל מקום ובכל זמן.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <div className="bg-blue-100 p-1 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-customBlue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">ממשק משתמש מותאם לכל גודל מסך</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-100 p-1 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-customBlue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">התראות בזמן אמת על הזמנות חדשות</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-100 p-1 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-customBlue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">סנכרון נתונים אוטומטי בין כל המכשירים</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Client Access Section */}
      <section 
        ref={clientsRef}
        className={`py-20 bg-gradient-to-b from-blue-50 to-white transition-all duration-700 transform ${
          visibleSections.clients ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">גישה חופשית ללקוחות</h2>
              <p className="text-xl text-gray-600 mb-8">
                לקוחות יכולים לצפות בקטלוג ולעשות הזמנות ללא עלות נוספת. המערכת מאפשרת ללקוחות לראות את ההיסטוריה שלהם, לעקוב אחר סטטוס ההזמנות ולבצע הזמנות חוזרות בקלות.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <div className="bg-green-100 p-1 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">צפייה במחירים מותאמים אישית</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-green-100 p-1 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">ביצוע הזמנות בכל שעה ומכל מקום</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-green-100 p-1 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">מעקב אחר סטטוס הזמנות בזמן אמת</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <div className="bg-white p-4 rounded-lg shadow-2xl border border-green-100">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold">הזמנה חדשה #12345</h3>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-500">תאריך: 15.06.2023</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">בטיפול</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <div className="font-medium">פריט</div>
                      <div className="flex space-x-8 space-x-reverse">
                        <div className="font-medium">כמות</div>
                        <div className="font-medium hidden md:block">מחיר יחידה</div>
                        <div className="font-medium">סה&quot;כ</div>
                      </div>
                    </div>
                    {[
                                        
                                          { name: "מוצר 1", qty: 2, price: 75 },
                                          { name: "מוצר 2", qty: 1, price: 120 },
                                          { name: "מוצר 3", qty: 3, price: 45 }
                                        ].map((item, idx) => (
                                          <div key={idx} className="flex justify-between items-center">
                                            <div>{item.name}</div>
                                            <div className="flex space-x-8 space-x-reverse">
                                              <div className="text-center">{item.qty}</div>
                                              <div className="w-20 text-center hidden md:block">₪{item.price}</div>
                                              <div className="text-left font-medium">₪{item.qty * item.price}</div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
                                        <div className="font-bold text-lg">סה&quot;כ:</div>
                                        <div className="font-bold text-lg text-green-600">₪435.00</div>
                                      </div>
                                      <div className="mt-6">
                                        <button className="w-full bg-customBlue hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
                                          צפה בפרטי ההזמנה
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </section>
                    
                          {/* Reports Section */}
                          <section 
                            ref={reportsRef}
                            className={`py-20 bg-gradient-to-b from-white to-purple-50 transition-all duration-700 transform ${
                              visibleSections.reports ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                            }`}
                          >
                            <div className="container mx-auto px-4">
                              <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                                  דו&quot;חות וניתוחים חכמים
                                </h2>
                                <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                                  מעקב אחרי ביצועים וסטטיסטיקות בלחיצה אחת
                                </p>
                              </div>
                              
                              <div className="bg-white p-6 rounded-xl shadow-xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-sm text-customBlue mb-1">סה&quot;כ הזמנות</div>
                                    <div className="text-2xl font-bold">1,248</div>
                                    <div className="text-xs text-green-600 mt-2 flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                      </svg>
                                      +12.5% מהחודש הקודם
                                    </div>
                                  </div>
                                  <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-sm text-green-600 mb-1">הכנסות</div>
                                    <div className="text-2xl font-bold">₪89,540</div>
                                    <div className="text-xs text-green-600 mt-2 flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                      </svg>
                                      +8.3% מהחודש הקודם
                                    </div>
                                  </div>
                                  <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="text-sm text-purple-600 mb-1">לקוחות חדשים</div>
                                    <div className="text-2xl font-bold">24</div>
                                    <div className="text-xs text-green-600 mt-2 flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                      </svg>
                                      +20% מהחודש הקודם
                                    </div>
                                  </div>
                                  <div className="bg-yellow-50 p-4 rounded-lg">
                                    <div className="text-sm text-yellow-600 mb-1">מוצרים פעילים</div>
                                    <div className="text-2xl font-bold">356</div>
                                    <div className="text-xs text-green-600 mt-2 flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                      </svg>
                                      +5.2% מהחודש הקודם
                                    </div>
                                  </div>
                                </div>
                                
                                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg h-64 flex items-center justify-center"> 
                                     <div className="text-center">
                                      <div className="text-lg font-medium text-gray-700 mb-2">גרף מכירות חודשי</div>
                                      <div className="flex items-end justify-center h-40 space-x-2 space-x-reverse">
                                        {[35, 45, 30, 60, 75, 90, 85, 70, 80, 95, 100, 85].map((height, idx) => (
                                          <div 
                                            key={idx} 
                                            className="w-8 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm"
                                            style={{ height: `${height}%` }}
                                          >
                                            <div className="text-xs text-blue-800 font-medium mt-2 transform -rotate-90 origin-bottom-left">
                                              {['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'][idx]}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div> 
                                  </div>
                                  <div className="bg-gray-50 p-4 rounded-lg h-64 flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="text-lg font-medium text-gray-700 mb-4">התפלגות מכירות</div>
                                      <div className="relative w-40 h-40 mx-auto">
                                        <div className="absolute inset-0 rounded-full border-8 border-blue-500"></div>
                                        <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-green-500 border-r-green-500" style={{ transform: 'rotate(45deg)' }}></div>
                                        <div className="absolute inset-0 rounded-full border-8 border-transparent border-b-purple-500" style={{ transform: 'rotate(180deg)' }}></div>
                                      </div>
                                      <div className="flex justify-center mt-4 space-x-4 space-x-reverse text-xs">
                                        <div className="flex items-center">
                                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                                          <span>מוצר א'</span>
                                        </div>
                                        <div className="flex items-center">
                                          <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                                          <span>מוצר ב'</span>
                                        </div>
                                        <div className="flex items-center">
                                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                                          <span>מוצר ג'</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div> */}
                              </div>
                            </div>
                          </section>
                    
                          {/* Pricing Section */}
                          <section 
                            ref={pricingRef}
                            className={`py-20 bg-gradient-to-b from-purple-50 to-white transition-all duration-700 transform ${
                              visibleSections.pricing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                            }`}
                          >
                            <div className="container mx-auto px-4">
                              <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                                  תמחור הוגן לצמיחת העסק
                                </h2>
                                <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                                  חבילות מותאמות לכל גודל עסק, ללא התחייבות ארוכת טווח
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 transition-transform duration-300 hover:transform hover:scale-105">
                                  <div className="text-center">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">בסיסי</h3>
                                    <div className="text-gray-500 mb-6">עד 100 מוצרים</div>
                                    <div className="text-4xl font-bold text-customBlue mb-6">₪99<span className="text-lg text-gray-500">/חודש</span></div>
                                  </div>
                                  <ul className="space-y-3 mb-8">
                                    <li className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>עד 100 מוצרים</span>
                                    </li>
                                    <li className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>עד 5 לקוחות</span>
                                    </li>
                                    <li className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>דו&quot;חות בסיסיים</span>
                                    </li>
                                    <li className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>תמיכה במייל</span>
                                    </li>
                                  </ul>
                                  <div className="mt-8">
                                    <Link href="/sign-up" className="block w-full bg-customBlue hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium transition-colors">
                                      התחל עכשיו
                                    </Link>
                                  </div>
                                </div>
                                
                                <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-blue-500 transform scale-105 z-10">
                                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-customBlue text-white px-4 py-1 rounded-full text-sm font-medium">
                                    הכי פופולרי
                                  </div>
                                  <div className="text-center">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">מתקדם</h3>
                                    <div className="text-gray-500 mb-6">עד 300 מוצרים</div>
                                    <div className="text-4xl font-bold text-customBlue mb-6">₪199<span className="text-lg text-gray-500">/חודש</span></div>
                                  </div>
                                  <ul className="space-y-3 mb-8">
                                    <li className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>עד 300 מוצרים</span>
                                    </li>
                                    <li className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>לקוחות ללא הגבלה</span>
                                    </li>
                                    <li className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>דו&quot;חות מתקדמים</span>
                                    </li>
                                    <li className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>תמיכה טלפונית</span>
                                    </li>
                                    <li className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>מנהל חשבון אישי</span>
                                    </li>
                                  </ul>
                                  <div className="mt-8">
                                    <Link href="/sign-up" className="block w-full bg-customBlue hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium transition-colors">
                                      התחל עכשיו
                                    </Link>
                                  </div>
                                </div>
                                
                                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 transition-transform duration-300 hover:transform hover:scale-105">
                                  <div className="text-center">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">פרימיום</h3>
                                    <div className="text-gray-500 mb-6">מעל 500 מוצרים</div>
                                    <div className="text-4xl font-bold text-customBlue mb-6">
                                      <Link href="#" className="text-customBlue hover:underline">קבל הצעה</Link>
                                    </div>
                                  </div>
                                  <ul className="space-y-3 mb-8">
                                    <li className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>מוצרים ללא הגבלה</span>
                                    </li>
                                    <li className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>לקוחות ללא הגבלה</span>
                                    </li>
                                    <li className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>דו&quot;חות מותאמים אישית</span>
                                    </li>
                                    <li className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>תמיכה VIP 24/7</span>
                                    </li>
                                    <li className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>מנהל חשבון אישי</span>
                                    </li>
                                  </ul>
                                  <div className="mt-8">
                                    <Link href="/sign-up" className="block w-full bg-customBlue hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium transition-colors">
                                      התחל עכשיו
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </section>
                    
                          {/* CTA Section */}
                          <section className="py-20 bg-customBlue">
                            <div className="container mx-auto px-4 text-center">
                              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                מוכנים להתחיל? הצטרפו ל-BClick עוד היום!
                              </h2>
                              <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
                                הצטרפו לאלפי עסקים שכבר משתמשים במערכת BClick לניהול ההזמנות שלהם
                              </p>
                              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 sm:space-x-reverse">
                                <Link href="/login" className="bg-white hover:bg-gray-100 text-customBlue px-8 py-3 rounded-full font-medium text-lg transition-colors duration-300 shadow-lg hover:shadow-xl">
                                  התחל עכשיו
                                </Link>
                                <a href="#" className="bg-transparent hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium text-lg transition-colors duration-300 border border-white">
                                  קבל הצעת מחיר
                                </a>
                              </div>
                            </div>
                          </section>
                    
                          {/* Footer */}
                          <footer className="bg-gray-900 text-white py-12">
                            <div className="container mx-auto px-4">
                              <div className="flex flex-col md:flex-row justify-between">
                                <div className="mb-8 md:mb-0">
                                  <div className="flex items-center mb-4">
                                    <Image src="/bclick-logo.jpg" alt="BClick Logo" width={40} height={40} />
                                    <span className="text-2xl font-bold text-white ml-2">BClick</span>
                                  </div>
                                  <p className="text-gray-400 max-w-xs">
                                    המערכת המובילה לניהול הזמנות לעסקים B2B בישראל
                                  </p>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                  <div>
                                    <h3 className="text-lg font-semibold mb-4">מוצר</h3>
                                    <ul className="space-y-2">
                                      <li><a href="#" className="text-gray-400 hover:text-white transition-colors">תכונות</a></li>
                                      <li><a href="#" className="text-gray-400 hover:text-white transition-colors">תמחור</a></li>
                                      <li><a href="#" className="text-gray-400 hover:text-white transition-colors">שאלות נפוצות</a></li>
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h3 className="text-lg font-semibold mb-4">חברה</h3>
                                    <ul className="space-y-2">
                                      <li><a href="#" className="text-gray-400 hover:text-white transition-colors">אודות</a></li>
                                      <li><a href="#" className="text-gray-400 hover:text-white transition-colors">בלוג</a></li>
                                      <li><a href="#" className="text-gray-400 hover:text-white transition-colors">קריירה</a></li>
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h3 className="text-lg font-semibold mb-4">תמיכה</h3>
                                    <ul className="space-y-2">
                                      <li><a href="#" className="text-gray-400 hover:text-white transition-colors">צור קשר</a></li>
                                      <li><a href="#" className="text-gray-400 hover:text-white transition-colors">מרכז עזרה</a></li>
                                      <li><a href="#" className="text-gray-400 hover:text-white transition-colors">מדיניות פרטיות</a></li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                                <p className="text-gray-400 text-sm">
                                  © {new Date().getFullYear()} BClick. כל הזכויות שמורות.
                                </p>
                                <div className="flex space-x-4 mt-4 md:mt-0">
                                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                    </svg>
                                  </a>
                                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                  </a>
                                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                    </svg>
                                  </a>
                                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.688 1.855.137.35.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                    </svg>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </footer>
                        </div>
                      );
                    }