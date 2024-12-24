import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)',"/(.*)"]);
// Define admin routes
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect(); // Redirects to sign-in if not authenticated
  }

  // Get authentication and session details
  const { sessionClaims } = await auth();

  // if (!sessionClaims) {
  //   console.log('No session claims found. Redirecting to sign-in.');
  //   // Redirect to sign-in if the user is not authenticated
  //   const signInUrl = new URL('/sign-in', req.url);
  //   return NextResponse.redirect(signInUrl);
  // }

  // Debug: Log session claims to inspect metadata
  console.log('Session Claims:', sessionClaims);

  // Check for admin-specific routes
  if (isAdminRoute(request)) {
    const role = sessionClaims.metadata?.role || 'client'; // Default to 'client' if role is missing
    console.log('User Role:', role);

    if (role !== 'admin') {
      console.log('User is not an admin. Redirecting to home.');
      // If not an admin, redirect to the home page
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // If all checks pass, allow the request to proceed
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static assets or API routes
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
