/**
 * TASK 5B — Rate Limiting Middleware
 * 1 минутанд 5-аас их request байвал block хийнэ.
 * IP хаягаар хянана.
 */

// Map<ip, { count, resetTime }>
const requestCounts = new Map();

const WINDOW_MS = 60 * 1000; // 1 минут
const MAX_REQUESTS = 5;

function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    // Шинэ цонх эхлүүл
    requestCounts.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader("Retry-After", retryAfter);
    return res.status(429).json({
      message: "Too many requests",
      retryAfter: `${retryAfter} seconds`,
    });
  }

  record.count++;
  next();
}

module.exports = rateLimitMiddleware;
