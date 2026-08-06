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

router.post("/", createSplit);
router.get("/", getSplitBills);
router.get("/:id", getSplitBillById);
router.patch("/:id/items/:itemId/pay", paySplitBillItem);
router.delete("/:id", deleteSplitBill);

export default router;
