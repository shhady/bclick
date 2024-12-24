import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define route matchers
const publicRoutes = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/(.*)', '/api/(.*)']);
const adminRoutes = createRouteMatcher(['/admin(.*)']);
const noCacheRoutes = createRouteMatcher(['/orders(.*)', '/api/orders(.*)']);

async function middleware(req) {
  const auth = clerkMiddleware();

  // Clone the response for modification
  const response = NextResponse.next();

  // Add cache control headers for specific routes
  if (noCacheRoutes(req)) {
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // Check if it's a public route
  if (publicRoutes(req)) {
    return response;
  }

  // Protect non-public routes
  await auth.protect();

  // Get authentication and session details
  const { sessionClaims } = await auth();

  // Debug: Log session claims to inspect metadata
  console.log('Session Claims:', sessionClaims);

  // Check for admin-specific routes
  if (adminRoutes(req)) {
    const role = sessionClaims?.metadata?.role || 'client';
    console.log('User Role:', role);

    if (role !== 'admin') {
      console.log('User is not an admin. Redirecting to home.');
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Match API routes
    '/api/(.*)',
    // Match order routes that need cache control
    '/orders/:path*',
    '/api/orders/:path*'
  ],
};

export default middleware;
