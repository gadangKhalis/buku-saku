import { Router } from "express";
import { authMiddle } from "../middlewares/auth.middle";
import {
  getCharData,
  downloadPdfReport,
  downloadExcelReport,
} from "../controllers/ReportCtr";

const router = Router();
router.use(authMiddle);
router.get("/chart-data", getCharData);
router.get("/pdf", downloadPdfReport);
router.get("/excel", downloadExcelReport);
export default router;
