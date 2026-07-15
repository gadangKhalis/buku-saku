import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../lib/prisma";
import { createTransactionSchema } from "../validations/transactionVal";
import { getTodayUsdToIdrRate } from "../services/currencyService";

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
