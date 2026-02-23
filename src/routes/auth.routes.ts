import { Router } from "express";
import {
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  guestCheckout,
  googleAuth,
  logout,
  refresh,
  login,
  getMe,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/google", googleAuth);
router.post("/guest-checkout", guestCheckout);
router.get("/me", authMiddleware, getMe);

export default router;
