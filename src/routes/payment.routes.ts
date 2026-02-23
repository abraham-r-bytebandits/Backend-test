import { Router } from "express";
import {
  createRazorpayOrder,
  verifyPayment,
  requestRefund,
  updateRefundStatus,
} from "../controllers/payment.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();


router.post("/razor-create", authMiddleware, createRazorpayOrder);

router.post("/razor-verify", authMiddleware, verifyPayment);


router.post("/refund", authMiddleware, requestRefund);



router.patch(
  "/refund/:refundId",
  authMiddleware,
  requireRole(["ADMIN", "VENDOR"]),
  updateRefundStatus
);

export default router;
