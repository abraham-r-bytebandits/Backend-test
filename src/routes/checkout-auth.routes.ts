import { Router } from "express"
import { startCheckout, verifyCheckoutOtp } from "../controllers/checkout.controller"
const router = Router()

router.post("/start", startCheckout)
router.post("/verify", verifyCheckoutOtp)

export default router