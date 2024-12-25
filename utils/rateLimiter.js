// import redis from './redis';

// export async function rateLimit(ip, options = {}) {
//   const { maxRequests = 100, windowMs = 15 * 60 * 1000 } = options;
//   const key = `rate-limit:${ip}`;
  
//   try {
//     const [current] = await redis
//       .multi()
//       .incr(key)
//       .expire(key, windowMs / 1000)
//       .exec();

//     const requestCount = current[1];
    
//     return {
//       isLimited: requestCount > maxRequests,
//       remaining: Math.max(maxRequests - requestCount, 0),
//       reset: Date.now() + windowMs
//     };
//   } catch (error) {
//     console.error('Rate limit error:', error);
//     return { isLimited: false, remaining: maxRequests, reset: Date.now() + windowMs };
//   }
// } 