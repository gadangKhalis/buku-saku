import { Router } from "express";
import { authMiddle } from "../middlewares/auth.middle";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - icon
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *                 example: Makanan & Minuman
 *               icon:
 *                 type: string
 *                 example: utensils
 *               color:
 *                 type: string
 *                 example: "#F87171"
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Category's name already exist
 */
router.post("/", authMiddle, createCategory);
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories owned by the logged-in user
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 */
router.get("/", authMiddle, getCategories);
/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a single category by id
 *     tags: [Category]
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
 *         description: Category fetched successfully
 *       404:
 *         description: Category not found
 */
router.get("/:id", authMiddle, getCategoryById);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category (partial update supported)
 *     tags: [Category]
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
 *               name:
 *                 type: string
 *                 example: Servis Kendaraan
 *               icon:
 *                 type: string
 *                 example: car
 *               color:
 *                 type: string
 *                 example: "#FB923C"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category's name already exist
 */
router.put("/:id", authMiddle, updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Category]
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
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       409:
 *         description: Cannot delete category that still has transactions
 */
router.delete("/:id", authMiddle, deleteCategory);

export default router;
