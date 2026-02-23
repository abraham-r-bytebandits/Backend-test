export const requestRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { orderItemId } = req.body;

    if (!orderItemId) {
      return res.status(400).json({ message: "orderItemId required" });
    }

    const item = await prisma.orderItem.findUnique({
      where: { id: BigInt(orderItemId) },
      include: {
        order: true,
        refunds: true,
      },
    });

    if (!item) {
      return res.status(404).json({ message: "Order item not found" });
    }

    if (item.order.accountPublicId !== req.publicId) {
      return res.status(403).json({ message: "Not your order" });
    }

    if (item.refunds.length > 0) {
      return res.status(400).json({ message: "Refund already requested" });
    }

    const refund = await prisma.refund.create({
      data: {
        orderItemId: item.id,
        paymentId: item.orderId,
        amount: item.total,
      },
    });

    res.json({ message: "Refund requested", refund });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Refund failed" });
  }
};
