import { Router } from "express";
import { authMiddle } from "../middlewares/auth.middle";
import { createTransaction } from "../controllers/transactionController";

const router = Router();

router.post("/", authMiddle, createTransaction);

export default router;
