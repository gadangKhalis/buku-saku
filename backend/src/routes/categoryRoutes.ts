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

router.post("/", authMiddle, createCategory);
router.get("/", authMiddle, getCategories);
router.get("/:id", authMiddle, getCategoryById);
router.put("/:id", authMiddle, updateCategory);
router.delete("/:id", authMiddle, deleteCategory);

export default router;
