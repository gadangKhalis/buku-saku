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

router.get("/", getBudget);
router.post("/", createBudget);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

export default router;
