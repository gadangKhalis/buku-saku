import { Router } from "express";
import { getAllUsers } from "../controllers/adminController";
import { authMiddle } from "../middlewares/auth.middle";
import { adminGuard } from "../middlewares/adminGuard";
import {
  getAllUsers,
  updateUserRole,
  getAuditLogs,
} from "../controllers/adminController";

const router = Router();

router.use(authMiddle);
router.use(adminGuard);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with transaction count (ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       403:
 *         description: Forbidden - ADMIN only
 */
router.get("/users", getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Update user role (ADMIN only)
 *     tags: [Admin]
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
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER]
 *                 example: ADMIN
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Role tidak valid
 *       403:
 *         description: Forbidden - ADMIN only
 */
router.put("/users/:id/role", updateUserRole);

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get audit logs with filter and pagination (ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *           enum: [Transaction, Category, Budget]
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Audit logs fetched successfully, includes pagination meta
 *       403:
 *         description: Forbidden - ADMIN only
 */
router.get("/audit-logs", getAuditLogs);

export default router;
