import { Router } from "express";
import { checkout, getMyOrders } from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { checkoutSchema } from "../validators/checkout.validator";
import { validate } from "../middlewares/validate";
import { updateOrderStatus } from "../controllers/order.controller";

const router = Router();

router.post(
  "/checkout",
  authMiddleware,
  validate(checkoutSchema),
  checkout
);

router.get("/order-details", authMiddleware, getMyOrders);
router.patch("/status/:orderId", authMiddleware, updateOrderStatus);


export default router;
