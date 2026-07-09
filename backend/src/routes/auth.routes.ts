import { Router } from "express";
import { register, login, logout } from "../controllers/auth.ctr";
import { authMiddle } from "../middlewares/auth.middle";
import { oauthSync } from "../controllers/auth.ctr";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: New User Registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 example: yourName@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: John
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Registration Failed / Email already registered
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *  post:
 *   summary: Login
 *   tags: [Auth]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       required:
 *        - email
 *        - password
 *       properties:
 *         email:
 *           type: string
 *           example: yourName@example.com
 *         password:
 *           type: string
 *           example: password123
 *
 *     responses:
 *       200:
 *         description: Login Successfully
 *       401:
 *         description: Login Failed / Email & Password wrong combination
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/logout:
 *  post:
 *      summary: Logout
 *      tags: [Auth]
 *      security:
 *          - cookieAuth: []
 *
 *      responses:
 *       200:
 *         description: Logout Successfully
 *       401:
 *         description: Unauthorized / token Invalid
 */
router.post("/logout", authMiddle, logout);

/**
 * @swagger
 * /api/auth/oauth-sync:
 *   post:
 *     summary: Sinkronisasi user dari OAuth provider (internal use only)
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         name: x-internal-secret
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
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               provider:
 *                 type: string
 *     responses:
 *       200:
 *         description: User ditemukan atau berhasil dibuat
 *       401:
 *         description: Internal secret tidak valid
 */
router.post("/oauth-sync", oauthSync);

export default router;
