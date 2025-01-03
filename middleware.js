import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// In-memory rate limiting store
const rateLimitStore = new Map();

// Configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // Max requests per window
};

/**
 * Rate limiting logic
 * @param {Request} request - The incoming request object
 * @returns {boolean} - Whether the request should be blocked
 */
function rateLimit(request) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();

  if (process.env.NODE_ENV === 'development') return false; // Skip rate limiting in development

  const record = rateLimitStore.get(ip) || { count: 0, startTime: now };

  // Reset counter if window has passed
  if (now - record.startTime > RATE_LIMIT_CONFIG.windowMs) {
    rateLimitStore.set(ip, { count: 1, startTime: now });
    return false; // Allow request
  }

  // Block request if max requests exceeded
  if (record.count >= RATE_LIMIT_CONFIG.maxRequests) {
    return true;
  }

  // Increment request count
  record.count += 1;
  rateLimitStore.set(ip, record);
  return false; // Allow request
}

// Route matchers
const PUBLIC_ROUTES = ['/sign-in(.*)', '/sign-up(.*)', '/sign-out(.*)', '/(.*)'];
const ADMIN_ROUTES = ['/admin(.*)'];
const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES);
const isAdminRoute = createRouteMatcher(ADMIN_ROUTES);

/**
 * Middleware handler
 */
export default clerkMiddleware(async (auth, request) => {
  // Apply rate limiting
  if (rateLimit(request)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  const response = NextResponse.next();
  addSecurityHeaders(response);

  // Disable cache for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  // Keep existing static asset caching
  else if (request.nextUrl.pathname.startsWith('/static/')) {
    addCacheHeaders(response);
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
    if (!isAdmin(sessionClaims)) {
      return redirectToHome(request);
    }
  }

  return response;
});

/**
 * Add security headers to the response
 */
function addSecurityHeaders(response) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-XSS-Protection', '1; mode=block');
}

/**
 * Add cache control headers for static assets
 */
function addCacheHeaders(response) {
  response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
}

/**
 * Check if the user has an admin role
 */
function isAdmin(sessionClaims) {
  const role = sessionClaims.metadata?.role || 'client';
  return role === 'admin';
}

/**
 * Redirect to home page
 */
function redirectToHome(request) {
  const homeUrl = new URL('/', request.url);
  return NextResponse.redirect(homeUrl);
}

// Middleware configuration
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
