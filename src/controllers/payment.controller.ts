import { razorpay } from "../services/razorpay.service";
import prisma from "../prisma/client";
import crypto from "crypto";
import { Request, Response } from "express";
import Razorpay from "razorpay";
import { AuthRequest } from "../middlewares/auth.middleware";


export const createRazorpayOrder = async (req: Request, res: Response) => {
  const { orderId } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: BigInt(orderId) },
  });

  if (!order) return res.status(404).json({ message: "Order not found" });

  const razorpayOrder = await razorpay.orders.create({
    amount: Number(order.totalAmount) * 100,
    currency: "INR",
    receipt: order.orderNumber,
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      paymentMethod: "UPI",
      amount: order.totalAmount,
      gateway: "RAZORPAY",
      gatewayTxnId: razorpayOrder.id,
    },
  });

  res.json({ razorpayOrder });
};

export const verifyPayment = async (req: Request, res: Response) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  const payment = await prisma.payment.findFirst({
    where: { gatewayTxnId: razorpay_order_id },
  });

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "SUCCESS",
      gatewayTxnId: razorpay_payment_id,
    },
  });

  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: "PAID" },
  });

  res.json({ message: "Payment verified successfully" });
};

export const requestRefund = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { orderItemId } = req.body;

    if (!req.publicId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!orderItemId) {
      return res.status(400).json({ message: "orderItemId is required" });
    }

   
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: BigInt(orderItemId),
        order: {
          accountPublicId: req.publicId,
        },
      },
      include: {
        order: {
          include: {
            payments: true,
          },
        },
        refunds: true,
      },
    });

    if (!orderItem) {
      return res.status(404).json({
        message: "Order item not found or does not belong to user",
      });
    }

    
    if (orderItem.refunds.length > 0) {
      return res.status(400).json({
        message: "Refund already requested for this item",
      });
    }

  
    if (orderItem.order.status !== "DELIVERED") {
      return res.status(400).json({
        message: "Only delivered orders can be refunded",
      });
    }

    const payment = orderItem.order.payments.find(
      (p) => p.status === "SUCCESS"
    );

    if (!payment) {
      return res.status(400).json({
        message: "No successful payment found for this order",
      });
    }

   
    const refund = await prisma.refund.create({
      data: {
        orderItemId: orderItem.id,
        paymentId: payment.id,
        amount: orderItem.total,
        status: "PENDING",
      },
    });

    res.json({
      message: "Refund request submitted successfully",
      refund,
    });
  } catch (error) {
    console.error("REFUND REQUEST ERROR:", error);
    res.status(500).json({
      message: "Failed to request refund",
    });
  }
};


export const updateRefundStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { refundId } = req.params;
    const { status } = req.body;

    if (!refundId) {
      return res.status(400).json({
        message: "Refund ID is required in URL",
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const existingRefund = await prisma.refund.findUnique({
      where: { id: BigInt(refundId) },
    });

    if (!existingRefund) {
      return res.status(404).json({
        message: "Refund not found",
      });
    }

    const updatedRefund = await prisma.refund.update({
      where: { id: BigInt(refundId) },
      data: { status },
    });

    return res.json({
      message: "Refund updated successfully",
      refund: updatedRefund,
    });
  } catch (error) {
    console.error("UPDATE REFUND ERROR:", error);
    return res.status(500).json({
      message: "Failed to update refund",
    });
  }
};


