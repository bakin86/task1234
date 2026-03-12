const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// GET /orders — бүх захиалга
app.get("/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      select: { id: true, product: true, price: true, userId: true },
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /orders/:id — нэг захиалга
app.get("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, product: true, price: true, userId: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "order-service", port: PORT });
});

app.listen(PORT, () => {
  console.log(`✅ Order Service running on http://localhost:${PORT}`);
});
