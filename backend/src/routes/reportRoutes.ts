import { Router } from "express";
import { authMiddle } from "../middlewares/auth.middle";
import {
  getChartData,
  downloadPdfReport,
  downloadExcelReport,
} from "../controllers/ReportCtr";

const router = Router();
router.use(authMiddle);
/**
 * @swagger
 * /api/reports/chart-data:
 *   get:
 *     summary: Get chart data for dashboard (monthly income vs expense)
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: "2026-09"
 *     responses:
 *       200:
 *         description: Chart data fetched successfully
 */
router.get("/chart-data", authMiddle, getChartData);

/**
 * @swagger
 * /api/reports/pdf:
 *   get:
 *     summary: Download monthly transaction report as PDF
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-09"
 *         description: Month to generate report for (format YYYY-MM)
 *     responses:
 *       200:
 *         description: PDF file stream
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Month parameter required
 */
router.get("/pdf", authMiddle, downloadPdfReport);

/**
 * @swagger
 * /api/reports/excel:
 *   get:
 *     summary: Download monthly transaction report as Excel
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-09"
 *         description: Month to generate report for (format YYYY-MM)
 *     responses:
 *       200:
 *         description: Excel file stream
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Month parameter required
 */
router.get("/excel", authMiddle, downloadExcelReport);
export default router;
