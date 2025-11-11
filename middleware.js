import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

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
const PUBLIC_ROUTES = ['/y(.*)', '/sign-up(.*)', '/sign-out(.*)', '/', '/catalog-preview(.*)', '/business-card(.*)', '/login(.*)', '/signup(.*)', '/api/auth(.*)'];
const ADMIN_ROUTES = ['/admin(.*)'];

function isPathMatch(patterns, pathname) {
  return patterns.some((pattern) => {
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
}

/**
 * Middleware handler
 */
export default async function middleware(request) {
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
  if (isPathMatch(PUBLIC_ROUTES, request.nextUrl.pathname)) {
    return response;
  }

  // Protect non-public routes with NextAuth token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const signInUrl = new URL('/login', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

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

// Admin route handling can be reintroduced by enriching the NextAuth token
// with role information and checking it here.

// Middleware configuration
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
