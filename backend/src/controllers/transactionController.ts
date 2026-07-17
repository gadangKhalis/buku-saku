import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../lib/prisma";
import {
  createTransactionSchema,
  getSummaryQuerySchema,
  getTransactionQuerySchema,
  updateTransactionSchema,
} from "../validations/transactionVal";
import { getTodayUsdToIdrRate } from "../services/currencyService";
import { getExchangeRate } from "./currencyController";
import { date, lte } from "zod";

export const createTransaction = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const parseResult = createTransactionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parseResult.error.flatten().fieldErrors,
    });
  }

  const { categoryId, amount, currency, type, description, date } =
    parseResult.data;

  try {
    // Ownership check
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Count amountInIDR & exchangeRate based on currency
    let amountInIDR: number;
    let exchangeRate: number;

    if (currency === "USD") {
      exchangeRate = await getTodayUsdToIdrRate();
      amountInIDR = amount * exchangeRate;
    } else {
      exchangeRate = 1;
      amountInIDR = amount;
    }

    // Save to database
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        categoryId,
        amount,
        currency,
        amountInIDR,
        exchangeRate,
        type,
        description,
        date,
      },
    });

    return res.status(201).json({
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Create transaction Error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const parseResult = getTransactionQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    return res.status(400).json({
      message: "Invalid query parameters",
      errors: parseResult.error.flatten().fieldErrors,
    });
  }
  const {
    categoryId,
    type,
    startDate,
    endDate,
    month,
    search,
    sort,
    minAmount,
    maxAmount,
  } = parseResult.data;

  let dateFilter: { gte?: Date; lte?: Date } | undefined;

  if (month) {
    const [year, monthNum] = month.split("-").map(Number);
    const firstDay = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0, 23, 59, 59, 999);
    dateFilter = { gte: firstDay, lte: lastDay };
  } else if (startDate || endDate) {
    dateFilter = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };
  }

  const orderByMap = {
    date_asc: { date: "asc" as const },
    date_desc: { date: "desc" as const },
    amount_asc: { amountInIDR: "asc" as const },
    amount_desc: { amountInIDR: "desc" as const },
  };

  try {
    const transaction = await prisma.transaction.findMany({
      where: {
        userId,
        ...(categoryId && { categoryId }),
        ...(type && { type }),
        ...(dateFilter && { date: dateFilter }),
        ...(search && {
          description: { contains: search, mode: "insensitive" },
        }),
        ...((minAmount || maxAmount) && {
          amountInIDR: {
            ...(minAmount && { gte: minAmount }),
            ...(maxAmount && { lte: maxAmount }),
          },
        }),
      },

      orderBy: { date: "desc" },
      include: { category: true },
    });
    return res.status(200).json({
      message: "Transactions fetched successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan  server" });
  }
};

export const getTransactionById = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res
      .status(200)
      .json({ message: "Transaction fetched successfully", data: transaction });
  } catch (error) {
    console.error("Get transaction by id error:", error);
    return res.status(500).json({ message: "Server Internal Error" });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const parseResult = updateTransactionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parseResult.error.flatten().fieldErrors,
    });
  }
  const input = parseResult.data;

  try {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (input.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: input.categoryId, userId },
      });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    const newAmount = input.amount ?? existing.amount;
    const newCurrency = input.currency ?? existing.currency;

    let amountInIDR = existing.amountInIDR;
    let exchangeRate = existing.exchangeRate;

    const amountOrCurrencyChanged =
      input.amount !== undefined || input.currency !== undefined;

    if (amountOrCurrencyChanged) {
      if (newCurrency === "USD") {
        exchangeRate = await getTodayUsdToIdrRate();
        amountInIDR = newAmount * exchangeRate;
      } else {
        exchangeRate = 1;
        amountInIDR = newAmount;
      }
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...input,
        amountInIDR,
        exchangeRate,
      },
    });
    return res
      .status(200)
      .json({ message: "Transaction updated successfully", data: updated });
  } catch (error) {
    console.error("Update transaction error:", error);
    return res.status(500).json({ message: "Server Internal Error" });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await prisma.transaction.delete({ where: { id } });

    return res
      .status(200)
      .json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const getTransactionSummary = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user!.id;

  const parseResult = getSummaryQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    return res.status(400).json({
      message: "Invalid query parameters",
      errors: parseResult.error.flatten().fieldErrors,
    });
  }

  const { month } = parseResult.data;

  // choose month range, from query or month ongoing
  const now = new Date();
  const targetMonth = month
    ? month.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  const [year, monthNum] = targetMonth;
  const firstDay = new Date(year, monthNum - 1, 1);
  const lastDay = new Date(year, monthNum, 0, 23, 59, 59, 999);

  try {
    const [incomeResult, expenseResult] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          date: { gte: firstDay, lte: lastDay },
        },
        _sum: { amountInIDR: true },
      }),

      prisma.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: firstDay, lte: lastDay },
        },
        _sum: { amountInIDR: true },
      }),
    ]);

    const totalIncome = incomeResult._sum?.amountInIDR ?? 0;
    const totalExpense = expenseResult._sum?.amountInIDR ?? 0;
    const balance = totalIncome - totalExpense;

    return res.status(200).json({
      message: "Summary fetched successfully",
      data: {
        month: `${year}-${String(monthNum).padStart(2, "0")}`,
        totalIncome,
        totalExpense,
        balance,
      },
    });
  } catch (error) {
    console.error("Get transaction SUmmary error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
