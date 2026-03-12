/**
 * Challenge 1 — Request Logger
 * Request бүрийн method, url, time, status-ийг log хийнэ.
 */
function loggerMiddleware(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const time = new Date().toISOString();
    console.log(
      `[${time}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}

module.exports = loggerMiddleware;
