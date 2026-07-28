import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../lib/prisma";

export const getCharData = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    // BAR CHART: Expense per month, last 6 month

    const now = new Date();
    const sixMonthAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const expenseTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: sixMonthAgo },
      },
      select: { date: true, amountInIDR: true },
    });

    // Prepare the "skeleton"
    const monthlyMap = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, 0);
    }

    for (const tx of expenseTransactions) {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const current = monthlyMap.get(key) ?? 0;
      monthlyMap.set(key, current + Number(tx.amountInIDR));
    }

    const barChartData = Array.from(monthlyMap.entries()).map(
      ([month, total]) => ({
        month,
        total: Math.round(total * 100) / 100,
      }),
    );

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const categoryUsage = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: startOfMonth, lt: startOfNextMonth },
      },
      _sum: { amountInIDR: true },
    });
    // take detail category
    const categoryIds = categoryUsage.map((c) => c.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true },
    });
    const categoryDetailMap = new Map(categories.map((c) => [c.id, c]));

    const pieChartData = categoryUsage.map((c) => {
      const detail = categoryDetailMap.get(c.categoryId);
      return {
        categoryId: c.categoryId,
        name: detail?.name ?? "unknown",
        color: detail?.color ?? "#9999",
        total: Math.round(Number(c._sum.amountInIDR ?? 0) * 100) / 100,
      };
    });

    return res.status(200).json({
      message: "Chart data fetched successfully ",
      data: { barChartData, pieChartData },
    });
  } catch (error) {
    console.error("Get chart data error", error);
    return res.status(500).json({ message: "failed to load chart" });
  }
};
