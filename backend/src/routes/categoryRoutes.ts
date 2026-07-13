import { Router } from "express";
import { authMiddle } from "../middlewares/auth.middle";
import { createCategory } from "../controllers/categoryController";

const router = Router();

router.post("/", authMiddle, createCategory);

export default router;
