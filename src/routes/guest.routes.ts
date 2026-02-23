import { Router } from "express"
import { guestCheckout } from "../controllers/guest.controller"

const router = Router()

router.post("/checkout", guestCheckout)

export default router
