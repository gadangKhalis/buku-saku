import { Router } from "express";
import { authMiddle } from "../middlewares/auth.middle";
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController";

const router = Router();

router.post("/", authMiddle, createTransaction);
router.get("/", authMiddle, getTransactions);
router.get("/:id", authMiddle, getTransactionById);
router.put("/:id", authMiddle, updateTransaction);
router.delete("/:id", authMiddle, deleteTransaction);

export default router;
