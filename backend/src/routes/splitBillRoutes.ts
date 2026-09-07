import { Router } from "express";
import {
  createSplit,
  getSplitBills,
  getSplitBillById,
  paySplitBillItem,
  deleteSplitBill,
} from "../controllers/splitBillCtr";
import { authMiddle } from "../middlewares/auth.middle";

const router = Router();

router.use(authMiddle);

/**
 * @swagger
 * /api/split-bills:
 *   post:
 *     summary: Create a split bill from a transaction
 *     tags: [Split Bill]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionId
 *               - items
 *             properties:
 *               transactionId:
 *                 type: string
 *                 example: cmriz7ry500008ctuofwa17zu
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: Bagian Budi
 *                     amount:
 *                       type: number
 *                       example: 50000
 *     responses:
 *       201:
 *         description: Split bill created successfully
 *       400:
 *         description: Total items tidak cocok dengan amount transaksi
 *       404:
 *         description: Transaction not found
 */
router.post("/", authMiddle, createSplit);
/**
 * @swagger
 * /api/split-bills:
 *   get:
 *     summary: Get all split bills owned by logged-in user
 *     tags: [Split Bill]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Split bills fetched successfully
 */
router.get("/", authMiddle, getSplitBills);
/**
 * @swagger
 * /api/split-bills/{id}:
 *   get:
 *     summary: Get a single split bill by ID including all items
 *     tags: [Split Bill]
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
 *         description: Split bill fetched successfully
 *       404:
 *         description: Split bill not found
 */
router.get("/:id", authMiddle, getSplitBillById);
/**
 * @swagger
 * /api/split-bills/{id}/items/{itemId}/pay:
 *   patch:
 *     summary: Mark a split bill item as paid
 *     tags: [Split Bill]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item marked as paid
 *       404:
 *         description: Item not found
 */
router.patch("/:id/items/:itemId/pay", authMiddle, paySplitBillItem);

/**
 * @swagger
 * /api/split-bills/{id}:
 *   delete:
 *     summary: Delete a split bill
 *     tags: [Split Bill]
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
 *         description: Split bill deleted successfully
 *       404:
 *         description: Split bill not found
 */
router.delete("/:id", authMiddle, deleteSplitBill);

export default router;
