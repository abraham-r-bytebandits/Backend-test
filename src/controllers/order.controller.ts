import { Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middlewares/auth.middleware";
import { razorpay } from "../services/razorpay.service";
import { OrderStatus } from "@prisma/client";

export const checkout = async (req: AuthRequest, res: Response) => {
  try {
    const { items, address } = req.body;

    if (!req.publicId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    const account = await prisma.account.findUnique({
      where: { publicId: req.publicId },
    });

    if (!account || account.status !== "ACTIVE") {
      return res.status(403).json({ message: "Account not active" });
    }

   

    const existingAddress = await prisma.address.findFirst({
      where: {
        accountPublicId: req.publicId,
        isDefault: true,
      },
    });

    if (!existingAddress) {
      await prisma.address.create({
        data: {
          accountPublicId: req.publicId,
          fullName: address.fullName,
          phone: address.phone,
          line1: address.address,
          city: address.city,
          state: address.state,
          postalCode: address.zipCode,
          country: address.country,
          isDefault: true,
        },
      });
    } else {
      await prisma.address.update({
        where: { id: existingAddress.id },
        data: {
          fullName: address.fullName,
          phone: address.phone,
          line1: address.address,
          city: address.city,
          state: address.state,
          postalCode: address.zipCode,
          country: address.country,
        },
      });
    }

 
  const subtotal = items.reduce(
  (sum: number, item: any) =>
    sum + Number(item.price) * Number(item.quantity),
  0
);

    const tax = subtotal * 0.08;
    const shippingFee = 9.99;
    const totalAmount = subtotal + tax + shippingFee;

 

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        accountPublicId: req.publicId,
        subtotal,
        tax,
        shippingFee,
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
          })),
        },
      },
    });

 

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(totalAmount) * 100), // convert to paisa
      currency: "INR",
      receipt: order.orderNumber,
    });

 

    await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: "UPI",
        amount: totalAmount,
        gateway: "RAZORPAY",
        gatewayTxnId: razorpayOrder.id,
      },
    });

  
    res.json({
      message: "Order created successfully",
      orderId: order.id,
      razorpayOrder,
      amount: totalAmount,
    });

  } catch (error) {
    console.error("CHECKOUT ERROR:", error);
    res.status(500).json({ message: "Checkout failed" });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { accountPublicId: req.publicId },
   include: {
  items: true,
  payments: {
    include: {
      refunds: true
    }
  }
},
    orderBy: { createdAt: "desc" },
  });

  res.json(orders);
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!req.role?.includes("ADMIN") && !req.role?.includes("VENDOR")) {
      return res.status(403).json({ message: "Forbidden" });
    }

   
    if (!Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = await prisma.order.update({
      where: { id: BigInt(orderId) },
      data: { status },
    });

    res.json({
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
};
