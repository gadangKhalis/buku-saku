import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../lib/prisma";
import {
  createTransactionSchema,
  getTransactionQuerySchema,
  updateTransactionSchema,
} from "../validations/transactionVal";
import { getTodayUsdToIdrRate } from "../services/currencyService";
import { getExchangeRate } from "./currencyController";

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
  const { categoryId, type, startDate, endDate } = parseResult.data;

  try {
    const transaction = await prisma.transaction.findMany({
      where: {
        userId,
        ...(categoryId && { categoryId }),
        ...(type && { type }),
        ...(startDate || endDate
          ? {
              date: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            }
          : {}),
      },

      orderBy: { date: "desc" },
      include: { category: true },
    });
    return res.status(200).json({
      message: "Transactions fetched successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Get transactions error:".error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
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
      const category = await prisma.transaction.findFirst({
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
        amountInIDR: newAmount;
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
    console.error("Update transaction error:".error);
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
