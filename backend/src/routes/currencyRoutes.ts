import { Router } from "express";
import { authMiddle } from "../middlewares/auth.middle";
import { getExchangeRate } from "../controllers/currencyController";

const router = Router();

router.get("/rate", authMiddle, getExchangeRate);

export default router;
