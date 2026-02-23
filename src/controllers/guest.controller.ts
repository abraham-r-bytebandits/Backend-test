import { Request, Response } from "express"
import prisma from "../prisma/client"
import { razorpay } from "../services/razorpay.service"

export const guestCheckout = async (req: Request, res: Response) => {
  try {
    const { items, address } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" })
    }

    /* ---------------- SAVE GUEST ADDRESS ---------------- */

    const guest = await prisma.guestCheckout.create({
      data: {
        fullName: address.fullName,
        email: address.email,
        phone: address.phone,
        line1: address.address,
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.zipCode,
      },
    })

    /* ---------------- CALCULATE TOTAL ---------------- */

    const subtotal = items.reduce(
      (sum: number, item: any) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    )

    const tax = subtotal * 0.08
    const shippingFee = 9.99
    const totalAmount = subtotal + tax + shippingFee

    /* ---------------- CREATE RAZORPAY ORDER ---------------- */

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `GUEST-${guest.id}`,
    })

    res.json({
      message: "Guest checkout created",
      guestId: guest.id,
      razorpayOrder,
      amount: totalAmount,
    })
  } catch (error) {
    console.error("GUEST CHECKOUT ERROR:", error)
    res.status(500).json({ message: "Guest checkout failed" })
  }
}
