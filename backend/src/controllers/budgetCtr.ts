import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../lib/prisma";
import { z } from "zod";

// Schema validation input budget
const budgetSchema = z.object({
  categoryId: z.string().min(1),
  limitIDR: z.number().positive(),
});

// GET /api/budgets - list all budget + usage this month
export const getBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const budget = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });

    // Aggregate total expense per kategori, just ongoing month
    const usageByCategory = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: startMonth, lte: startNextMonth },
      },
      _sum: { amountInIDR: true },
    });

    const usageMap = new Map(
      usageByCategory.map((u) => [
        u.categoryId,
        Number(u._sum.amountInIDR ?? 0),
      ]),
    );

    // combine budget + usage
    const result = budget.map((budget) => {
      const totalSpent = usageMap.get(budget.categoryId) ?? 0;
      const limit = Number(budget.limitIDR);
      const usagePercent = limit > 0 ? (totalSpent / limit) * 100 : 0;

      const round2 = (n: number) => Math.round(n * 100) / 100;

      return {
        ...budget,
        totalSpent: round2(totalSpent),
        usagePercent: round2(usagePercent),
        remaining: round2(limit - totalSpent),
        isWarning: usagePercent >= 80 && usagePercent < 100,
        isExceeded: usagePercent >= 100,
      };
    });
    res.json({ data: result });
  } catch (error) {
    console.error("getBudget Error: ", error);
    res.status(500).json({ message: " failed to load budget data" });
  }
};

// POST /api/budget
export const createBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const parsed = budgetSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Input invalid", error: parsed.error.flatten() });
    }

    const budget = await prisma.budget.create({
      data: { userId, ...parsed.data },
      include: { category: true },
    });
    res.status(201).json({ data: budget });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "This category already have active budget" });
    }
    console.error("createBudget error: ", error);
    res.status(500).json({ message: "Failed to load budget" });
  }
};

// PUT /api/budgets/:id — update limit budget
export const updateBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.body!.id;
    const { id } = req.params;

    const existing = await prisma.budget.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: "Budget not found" });
    }

    const parsed = z
      .object({ limitIDR: z.number().positive() })
      .safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Input not valid" });
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: { limitIDR: parsed.data.limitIDR },
      include: { category: true },
    });
    res.json({ data: updated });
  } catch (error) {
    console.error("Update budget error: ", error);
    res.status(500).json({ message: "Failed to update budget" });
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.budget.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: "Budget tidak ditemukan" });
    }

    await prisma.budget.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("deleteBudget error:", error);
    res.status(500).json({ message: "Gagal menghapus budget" });
  }
};
