import { Router } from "express";
import { authMiddle } from "../middlewares/auth.middle";
import {
  createTransaction,
  getTransactions,
} from "../controllers/transactionController";

const router = Router();

router.post("/", authMiddle, createTransaction);
router.get("/", authMiddle, getTransactions);
export default router;
