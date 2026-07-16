import { Router } from "express";
import { authMiddle } from "../middlewares/auth.middle";
import { getExchangeRate } from "../controllers/currencyController";

const router = Router();
/**
 * @swagger
 * /api/currency/rate:
 *   get:
 *     summary: Get today's USD to IDR exchange rate (cached daily)
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Exchange rate fetched successfully
 *       500:
 *         description: Failed to fetch exchange rate
 */
router.get("/rate", authMiddle, getExchangeRate);

export default router;
