import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import rateLimit from "express-rate-limit";
import productRoutes from "./routes/product.routes";
import paymentRoutes from "./routes/payment.routes";
import orderRoutes from "./routes/order.routes";
import guestRoutes from "./routes/guest.routes";
import checkoutAuthRoutes from "./routes/checkout-auth.routes";
const PORT = 4000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.use(limiter);
app.use("/api/products", productRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/guest", guestRoutes)
app.use("/api/checkout", checkoutAuthRoutes)

