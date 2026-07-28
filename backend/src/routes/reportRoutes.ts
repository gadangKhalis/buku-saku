import { Router } from "express";
import { authMiddle } from "../middlewares/auth.middle";
import { getCharData } from "../controllers/ReportCtr";

const router = Router();
router.use(authMiddle);
router.get("/chart-data", getCharData);
export default router;
