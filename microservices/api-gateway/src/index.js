require("dotenv").config();
const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { createProxyMiddleware } = require("http-proxy-middleware");

const authMiddleware = require("./middlewares/auth");
const requireRole = require("./middlewares/role");
const rateLimitMiddleware = require("./middlewares/rateLimit");
const loggerMiddleware = require("./middlewares/logger");

const app = express();
const PORT = process.env.PORT || 3000;

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://localhost:3002";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

app.use(express.json());

// Challenge 1 — Logging бүх request дээр
app.use(loggerMiddleware);

// ─────────────────────────────────────────────
// Token үүсгэх туршилтын endpoint (dev only)
// POST /auth/token  { "name": "Temuulen", "role": "ADMIN" }
// ─────────────────────────────────────────────
app.post("/auth/token", (req, res) => {
  const { name, role } = req.body;
  if (!name || !role) {
    return res.status(400).json({ message: "name and role required" });
  }
  const token = jwt.sign({ name, role }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// ─────────────────────────────────────────────
// TASK 5B — Rate limit (бүх /api route дээр)
// ─────────────────────────────────────────────
app.use("/api", rateLimitMiddleware);

// ─────────────────────────────────────────────
// TASK 4 — Auth middleware (бүх /api route дээр)
// ─────────────────────────────────────────────
app.use("/api", authMiddleware);

// ─────────────────────────────────────────────
// TASK 3 — Proxy routes
// /api/users → User Service
// /api/orders → Order Service
// ─────────────────────────────────────────────
app.use(
  "/api/users",
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/users": "/users" },
    on: {
      error: (err, req, res) => {
        // Challenge 3 — Error handling
        console.error("[Gateway] User Service error:", err.message);
        res.status(503).json({ message: "Service unavailable" });
      },
    },
  })
);

app.use(
  "/api/orders",
  createProxyMiddleware({
    target: ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/orders": "/orders" },
    on: {
      error: (err, req, res) => {
        // Challenge 3 — Error handling
        console.error("[Gateway] Order Service error:", err.message);
        res.status(503).json({ message: "Service unavailable" });
      },
    },
  })
);

// ─────────────────────────────────────────────
// TASK 5A — Admin only route
// /api/admin → зөвхөн ADMIN role
// ─────────────────────────────────────────────
app.get("/api/admin", requireRole("ADMIN"), (req, res) => {
  res.json({
    message: "Welcome to admin panel",
    user: req.user,
  });
});

// ─────────────────────────────────────────────
// Challenge 2 — Dashboard endpoint
// User + Order мэдээллийг нэгтгэн буцаана
// ─────────────────────────────────────────────
app.get("/api/dashboard", async (req, res) => {
  try {
    const [usersRes, ordersRes] = await Promise.all([
      axios.get(`${USER_SERVICE_URL}/users`),
      axios.get(`${ORDER_SERVICE_URL}/orders`),
    ]);

    res.json({
      users: usersRes.data,
      orders: ordersRes.data,
      summary: {
        totalUsers: usersRes.data.length,
        totalOrders: ordersRes.data.length,
      },
    });
  } catch (error) {
    // Challenge 3 — Error handling
    console.error("[Gateway] Dashboard error:", error.message);
    res.status(503).json({ message: "Service unavailable" });
  }
});

// Gateway health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    port: PORT,
    upstreams: {
      userService: USER_SERVICE_URL,
      orderService: ORDER_SERVICE_URL,
    },
  });
});

app.listen(PORT, () => {
  console.log(`✅ API Gateway running on http://localhost:${PORT}`);
  console.log(`   → /api/users  → ${USER_SERVICE_URL}`);
  console.log(`   → /api/orders → ${ORDER_SERVICE_URL}`);
});
