import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// In-memory rate limiting store
const rateLimitStore = new Map();

/**
 * Rate limiting function
 * @param {Request} request - Incoming request object
 * @returns {boolean} - Whether the request should be blocked
 */
function rateLimit(request) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Limit each IP to 100 requests per window

  const requestRecord = rateLimitStore.get(ip) || { count: 0, startTime: now };

  // Reset the counter if the time window has passed
  if (now - requestRecord.startTime > windowMs) {
    rateLimitStore.set(ip, { count: 1, startTime: now });
    return false; // Allow the request
  }

  if (requestRecord.count >= maxRequests) {
    return true; // Block the request
  }

  // Increment the request count
  requestRecord.count += 1;
  rateLimitStore.set(ip, requestRecord);
  return false; // Allow the request
}

// Define public and admin routes
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, request) => {
  // Apply rate limiting
  if (rateLimit(request)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Add cache control for static assets
  if (request.nextUrl.pathname.startsWith('/static/')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
    return response;
  }

  // Allow public routes without authentication
  if (isPublicRoute(request)) {
    return response;
  }

  // Protect non-public routes
  await auth.protect();

  // Check admin role for admin routes
  const { sessionClaims } = await auth();
  if (isAdminRoute(request)) {
    const role = sessionClaims.metadata?.role || 'client';
    if (role !== 'admin') {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};


// using Redis 


// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
// import { NextResponse } from 'next/server';

// // In-memory rate limiting store
// const rateLimitStore = new Map();

// /**
//  * Rate limiting function
//  * @param {Request} request - Incoming request object
//  * @returns {boolean} - Whether the request should be blocked
//  */
// function rateLimit(request) {
//   const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
//   const now = Date.now();
//   const windowMs = 15 * 60 * 1000; // 15 minutes
//   const maxRequests = 100; // Limit each IP to 100 requests per window

//   const requestRecord = rateLimitStore.get(ip) || { count: 0, startTime: now };

//   // Reset the counter if the time window has passed
//   if (now - requestRecord.startTime > windowMs) {
//     rateLimitStore.set(ip, { count: 1, startTime: now });
//     return false; // Allow the request
//   }

//   if (requestRecord.count >= maxRequests) {
//     return true; // Block the request
//   }

//   // Increment the request count
//   requestRecord.count += 1;
//   rateLimitStore.set(ip, requestRecord);
//   return false; // Allow the request
// }

// // Define public and admin routes
// const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);
// const isAdminRoute = createRouteMatcher(['/admin(.*)']);

// export default clerkMiddleware(async (auth, request) => {
//   // Apply rate limiting
//   if (rateLimit(request)) {
//     return new NextResponse('Too Many Requests', { status: 429 });
//   }

//   // Add security headers
//   const response = NextResponse.next();
//   response.headers.set('X-Frame-Options', 'DENY');
//   response.headers.set('X-Content-Type-Options', 'nosniff');
//   response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
//   response.headers.set(
//     'Strict-Transport-Security',
//     'max-age=31536000; includeSubDomains'
//   );
//   response.headers.set('X-XSS-Protection', '1; mode=block');

//   // Add cache control for static assets
//   if (request.nextUrl.pathname.startsWith('/static/')) {
//     response.headers.set(
//       'Cache-Control',
//       'public, max-age=31536000, immutable'
//     );
//     return response;
//   }

//   // Allow public routes without authentication
//   if (isPublicRoute(request)) {
//     return response;
//   }

//   // Protect non-public routes
//   await auth.protect();

//   // Check admin role for admin routes
//   const { sessionClaims } = await auth();
//   if (isAdminRoute(request)) {
//     const role = sessionClaims.metadata?.role || 'client';
//     if (role !== 'admin') {
//       const homeUrl = new URL('/', request.url);
//       return NextResponse.redirect(homeUrl);
//     }
//   }

//   return response;
// });

// export const config = {
//   matcher: [
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     '/(api|trpc)(.*)',
//   ],
// };
