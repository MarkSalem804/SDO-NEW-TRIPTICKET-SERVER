const rateLimits = new Map();

/**
 * Simple In-Memory Rate Limiter Middleware
 * @param {number} windowMs - Time window in milliseconds (e.g., 15 * 60 * 1000 for 15 mins)
 * @param {number} maxRequests - Max requests allowed per IP in the window
 */
const rateLimiter = (windowMs, maxRequests) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    
    // Clean up expired entries occasionally (10% chance per request)
    if (Math.random() < 0.1) {
      for (const [key, value] of rateLimits.entries()) {
        if (now > value.resetTime) {
          rateLimits.delete(key);
        }
      }
    }

    let limitGroup = rateLimits.get(ip);

    // If no record or current time is past the reset window
    if (!limitGroup || now > limitGroup.resetTime) {
      limitGroup = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimits.set(ip, limitGroup);
      
      // Send standard headers for transparency
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      return next();
    }

    // Increment count
    limitGroup.count++;
    
    // Always update headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - limitGroup.count));

    if (limitGroup.count > maxRequests) {
      const retryAfter = Math.ceil((limitGroup.resetTime - now) / 1000);
      return res.status(429).json({
        message: "Maximum login attempts reached.",
        retryAfterSeconds: retryAfter,
        limit: maxRequests,
        remaining: 0
      });
    }

    next();
  };
};

module.exports = rateLimiter;
