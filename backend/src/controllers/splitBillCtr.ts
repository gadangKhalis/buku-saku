import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const createSplit = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { transactionId, note, items } = req.body;

    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const existing = await prisma.splitBill.findUnique({
      where: { transactionId },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Transaction already has a split bill" });
    }

    const totalItems: number = items.reduce(
      (sum: number, item: { amount: number }) => sum + item.amount,
      0,
    );

    if (Math.abs(totalItems - transaction.amountInIDR) > 0.01) {
      return res.status(400).json({
        message: `Total of items (${totalItems}) must equal transaction amount (${transaction.amountInIDR})`,
      });
    }

    const splitBill = await prisma.splitBill.create({
      data: {
        transactionId,
        totalAmount: transaction.amountInIDR,
        note,
        items: {
          create: items.map(
            (item: { name: string; email?: string; amount: number }) => ({
              name: item.name,
              email: item.email,
              amount: item.amount,
            }),
          ),
        },
      },
      include: {
        items: true,
      },
    });
    return res.status(201).json(splitBill);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/split-bills
export const getSplitBills = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const splitBills = await prisma.splitBill.findMany({
      where: {
        transaction: { userId },
      },
      include: {
        transaction: {
          select: { description: true, date: true, amountInIDR: true },
        },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(splitBills);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/split-bills/:id
export const getSplitBillById = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const splitBill = await prisma.splitBill.findFirst({
      where: {
        id,
        transaction: { userId },
      },
      include: {
        transaction: {
          select: { description: true, date: true, amountInIDR: true },
        },
        items: true,
      },
    });

    if (!splitBill) {
      return res.status(404).json({ message: "Split bill not found" });
    }

    return res.status(200).json(splitBill);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// PATCH /api/split-bills/:id/items/:itemId/pay
export const paySplitBillItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id, itemId } = req.params;

    const splitBill = await prisma.splitBill.findFirst({
      where: {
        id,
        transaction: { userId },
      },
    });

    if (!splitBill) {
      return res.status(404).json({ message: "Split bill not found" });
    }

    const updatedItem = await prisma.splitBillItem.update({
      where: { id: itemId },
      data: { isPaid: true, paidAt: new Date() },
    });

    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/split-bills/:id
export const deleteSplitBill = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const splitBill = await prisma.splitBill.findFirst({
      where: {
        id,
        transaction: { userId },
      },
    });

    if (!splitBill) {
      return res.status(404).json({ message: "Split bill not found" });
    }

    await prisma.splitBill.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
