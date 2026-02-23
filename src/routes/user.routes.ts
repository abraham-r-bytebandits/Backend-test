import { Router } from "express";
import {
  getProfile,
  updateProfile,
  deleteAccount,
  getAddress,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.delete("/account", authMiddleware, deleteAccount);
router.get("/address", authMiddleware, getAddress);

export default router;
