import { Router } from "express";
import { authMiddle } from "../middlewares/auth.middle";
import {
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../controllers/budgetCtr";

const router = Router();

router.use(authMiddle);

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Get all budgets with usage percentage and warning status
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: "2026-09"
 *         description: Filter by month (format YYYY-MM)
 *     responses:
 *       200:
 *         description: Budgets fetched successfully, includes usagePercent and isWarning
 */
router.get("/", authMiddle, getBudget);
/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Create a new budget
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - amount
 *               - month
 *             properties:
 *               categoryId:
 *                 type: string
 *                 example: cmriz7ry500008ctuofwa17zu
 *               amount:
 *                 type: number
 *                 example: 1000000
 *               month:
 *                 type: string
 *                 example: "2026-09"
 *     responses:
 *       201:
 *         description: Budget created successfully
 *       400:
 *         description: Validation failed
 */
router.post("/", authMiddle, createBudget);
/**
 * @swagger
 * /api/budgets/{id}:
 *   put:
 *     summary: Update a budget
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1500000
 *               month:
 *                 type: string
 *                 example: "2026-09"
 *     responses:
 *       200:
 *         description: Budget updated successfully
 *       404:
 *         description: Budget not found
 */
router.put("/:id", authMiddle, updateBudget);
/**
 * @swagger
 * /api/budgets/{id}:
 *   delete:
 *     summary: Delete a budget
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget deleted successfully
 *       404:
 *         description: Budget not found
 */
router.delete("/:id", authMiddle, deleteBudget);
export default router;
