import { Response } from "express";
import { AuthRequest } from "../types";
import { getTodayUsdToIdrRate } from "../services/currencyService";

export const getExchangeRate = async (req: AuthRequest, res: Response) => {
  try {
    const rate = await getTodayUsdToIdrRate();
    return res.status(200).json({
      message: "Exchange rate fetched successfully",
      data: {
        base: "USD",
        target: "IDR",
        rate,
      },
    });
  } catch (error) {
    console.error("Get exchange rate error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
