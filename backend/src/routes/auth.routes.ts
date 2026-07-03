import { Router } from "express";
import { register, login, logout } from "../controllers/auth.ctr";
import { authMiddle } from "../middlewares/auth.middle";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/post", authMiddle, logout);

export default router;
